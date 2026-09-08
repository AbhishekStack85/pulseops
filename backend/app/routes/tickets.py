from datetime import datetime
from typing import List, Optional
import uuid
from fastapi import APIRouter, HTTPException, Query
from app.database import db_manager
from app.models import (
    TicketCreate,
    TicketResponse,
    TicketStatusUpdate,
    MessageCreateRequest,
    TicketMessage,
    TicketStatus,
    TicketPriority,
    TicketCategory,
    MessageRole,
)
from app.services.triage_engine import analyze_and_triage
from app.services.sla_tracker import compute_sla_metrics

router = APIRouter(prefix="/tickets", tags=["Tickets"])

# Active WebSocket manager reference to broadcast changes
ws_broadcaster = None

def set_broadcaster(broadcaster):
    global ws_broadcaster
    ws_broadcaster = broadcaster

async def broadcast_event(event_type: str, data: dict):
    if ws_broadcaster:
        try:
            await ws_broadcaster.broadcast({"type": event_type, "data": data})
        except Exception:
            pass

@router.get("", response_model=List[TicketResponse])
async def list_tickets(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    query = {}
    if status and status != "all":
        query["status"] = status
    if priority and priority != "all":
        query["priority"] = priority
    if category and category != "all":
        query["category"] = category

    cursor = db_manager.tickets.find(query)
    raw_tickets = await cursor.to_list(length=200)

    # Filter search text in memory
    results = []
    for raw in raw_tickets:
        if search:
            s = search.lower()
            text = f"{raw.get('ticket_number', '')} {raw.get('subject', '')} {raw.get('customer_name', '')} {raw.get('customer_email', '')}".lower()
            if s not in text:
                continue

        # Clean _id and compute live SLA metrics
        ticket_data = dict(raw)
        if "_id" in ticket_data and "id" not in ticket_data:
            ticket_data["id"] = str(ticket_data["_id"])
        elif "_id" in ticket_data:
            del ticket_data["_id"]

        enriched = compute_sla_metrics(ticket_data)
        results.append(TicketResponse(**enriched))

    # Sort: Breached and Critical first, then by created_at desc
    results.sort(
        key=lambda t: (
            0 if t.is_breached and t.status not in [TicketStatus.RESOLVED, TicketStatus.CLOSED] else 1,
            0 if t.priority == TicketPriority.CRITICAL else (1 if t.priority == TicketPriority.HIGH else 2),
            t.remaining_seconds
        )
    )
    return results


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: str):
    raw = await db_manager.tickets.find_one({"id": ticket_id})
    if not raw:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket_data = dict(raw)
    if "_id" in ticket_data and "id" not in ticket_data:
        ticket_data["id"] = str(ticket_data["_id"])
    elif "_id" in ticket_data:
        del ticket_data["_id"]

    enriched = compute_sla_metrics(ticket_data)
    return TicketResponse(**enriched)


@router.post("", response_model=TicketResponse, status_code=201)
async def create_ticket(payload: TicketCreate):
    count = await db_manager.tickets.count_documents({})
    ticket_num = f"PULSE-{101 + count}"
    ticket_id = str(uuid.uuid4())

    # Smart auto-triage calculation
    priority, sla_hours, deadline, tags = analyze_and_triage(
        category=payload.category,
        subject=payload.subject,
        description=payload.description,
        manual_priority=payload.priority
    )

    now_iso = datetime.utcnow().isoformat()
    first_msg = TicketMessage(
        sender_name=payload.customer_name,
        role=MessageRole.CUSTOMER,
        content=payload.description,
        is_internal=False,
        created_at=now_iso
    )

    doc = {
        "id": ticket_id,
        "ticket_number": ticket_num,
        "customer_name": payload.customer_name,
        "customer_email": payload.customer_email,
        "category": payload.category.value,
        "priority": priority.value,
        "status": TicketStatus.OPEN.value,
        "subject": payload.subject,
        "description": payload.description,
        "assigned_to": payload.assigned_to or "Unassigned",
        "sla_target_hours": sla_hours,
        "sla_deadline": deadline.isoformat(),
        "is_breached": False,
        "remaining_seconds": sla_hours * 3600,
        "created_at": now_iso,
        "updated_at": now_iso,
        "resolved_at": None,
        "messages": [first_msg.model_dump()],
        "tags": tags,
    }

    await db_manager.tickets.insert_one(doc)
    
    # Audit log
    await db_manager.activity_logs.insert_one({
        "ticket_id": ticket_id,
        "action": "TICKET_CREATED",
        "details": f"Ticket {ticket_num} created with {priority.value.upper()} priority ({sla_hours}h SLA).",
        "timestamp": now_iso
    })

    enriched = compute_sla_metrics(dict(doc))
    response = TicketResponse(**enriched)

    # Broadcast via WebSocket
    await broadcast_event("TICKET_CREATED", response.model_dump())
    return response


@router.patch("/{ticket_id}/status", response_model=TicketResponse)
async def update_ticket_status(ticket_id: str, payload: TicketStatusUpdate):
    raw = await db_manager.tickets.find_one({"id": ticket_id})
    if not raw:
        raise HTTPException(status_code=404, detail="Ticket not found")

    now = datetime.utcnow()
    now_iso = now.isoformat()
    update_set = {
        "status": payload.status.value,
        "updated_at": now_iso
    }

    # If resolving, calculate SLA compliance
    if payload.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED] and not raw.get("resolved_at"):
        update_set["resolved_at"] = now_iso
        deadline = datetime.fromisoformat(raw["sla_deadline"].replace("Z", "+00:00")).replace(tzinfo=None)
        update_set["is_breached"] = now > deadline

    await db_manager.tickets.update_one({"id": ticket_id}, {"$set": update_set})

    if payload.note:
        note_msg = TicketMessage(
            sender_name=payload.agent_name or "Support Agent",
            role=MessageRole.AGENT,
            content=f"Status changed to {payload.status.value.upper()}. Note: {payload.note}",
            is_internal=True,
            created_at=now_iso
        )
        await db_manager.tickets.update_one({"id": ticket_id}, {"$push": {"messages": note_msg.model_dump()}})

    updated_doc = await db_manager.tickets.find_one({"id": ticket_id})
    if "_id" in updated_doc:
        del updated_doc["_id"]

    enriched = compute_sla_metrics(updated_doc)
    response = TicketResponse(**enriched)

    await broadcast_event("TICKET_UPDATED", response.model_dump())
    return response


@router.post("/{ticket_id}/messages", response_model=TicketResponse)
async def add_message(ticket_id: str, payload: MessageCreateRequest):
    raw = await db_manager.tickets.find_one({"id": ticket_id})
    if not raw:
        raise HTTPException(status_code=404, detail="Ticket not found")

    now_iso = datetime.utcnow().isoformat()
    msg = TicketMessage(
        sender_name=payload.sender_name,
        role=payload.role,
        content=payload.content,
        is_internal=payload.is_internal,
        created_at=now_iso
    )

    update_set = {"updated_at": now_iso}
    # Auto-move from Open to In Progress if agent replied
    if raw.get("status") == TicketStatus.OPEN.value and payload.role == MessageRole.AGENT:
        update_set["status"] = TicketStatus.IN_PROGRESS.value

    await db_manager.tickets.update_one(
        {"id": ticket_id},
        {
            "$push": {"messages": msg.model_dump()},
            "$set": update_set
        }
    )

    updated_doc = await db_manager.tickets.find_one({"id": ticket_id})
    if "_id" in updated_doc:
        del updated_doc["_id"]

    enriched = compute_sla_metrics(updated_doc)
    response = TicketResponse(**enriched)

    await broadcast_event("MESSAGE_ADDED", {"ticket_id": ticket_id, "message": msg.model_dump()})
    return response


@router.delete("/{ticket_id}")
async def delete_ticket(ticket_id: str):
    result = await db_manager.tickets.delete_one({"id": ticket_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    await broadcast_event("TICKET_DELETED", {"ticket_id": ticket_id})
    return {"status": "success", "message": "Ticket deleted"}
