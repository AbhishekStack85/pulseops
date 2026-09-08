from datetime import datetime
from fastapi import APIRouter
from app.database import db_manager
from app.models import AnalyticsSummary, TicketStatus, TicketPriority, TicketCategory
from app.services.sla_tracker import compute_sla_metrics

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsSummary)
async def get_analytics_summary():
    cursor = db_manager.tickets.find({})
    raw_tickets = await cursor.to_list(length=1000)

    total = len(raw_tickets)
    if total == 0:
        return AnalyticsSummary(
            total_tickets=0,
            open_tickets=0,
            in_progress_tickets=0,
            resolved_tickets=0,
            breached_tickets=0,
            sla_compliance_rate=100.0,
            avg_resolution_time_hours=0.0,
            priority_distribution={p.value: 0 for p in TicketPriority},
            category_distribution={c.value: 0 for c in TicketCategory},
        )

    open_count = 0
    in_prog_count = 0
    resolved_count = 0
    breached_count = 0
    resolution_durations = []

    priority_dist = {p.value: 0 for p in TicketPriority}
    category_dist = {c.value: 0 for c in TicketCategory}

    for raw in raw_tickets:
        ticket = compute_sla_metrics(dict(raw))
        status = ticket.get("status")
        priority = ticket.get("priority")
        category = ticket.get("category")
        is_breached = ticket.get("is_breached", False)

        if priority in priority_dist:
            priority_dist[priority] += 1
        if category in category_dist:
            category_dist[category] += 1

        if status == TicketStatus.OPEN.value:
            open_count += 1
        elif status == TicketStatus.IN_PROGRESS.value:
            in_prog_count += 1
        elif status in [TicketStatus.RESOLVED.value, TicketStatus.CLOSED.value]:
            resolved_count += 1
            # Calculate duration
            if ticket.get("resolved_at") and ticket.get("created_at"):
                try:
                    c_time = datetime.fromisoformat(ticket["created_at"].replace("Z", "+00:00")).replace(tzinfo=None)
                    r_time = datetime.fromisoformat(ticket["resolved_at"].replace("Z", "+00:00")).replace(tzinfo=None)
                    dur_hours = (r_time - c_time).total_seconds() / 3600.0
                    if dur_hours >= 0:
                        resolution_durations.append(dur_hours)
                except Exception:
                    pass

        if is_breached:
            breached_count += 1

    # SLA Compliance rate
    compliance_rate = round(max(0.0, ((total - breached_count) / total) * 100.0), 1)
    avg_res_time = round(sum(resolution_durations) / len(resolution_durations), 1) if resolution_durations else 0.0

    return AnalyticsSummary(
        total_tickets=total,
        open_tickets=open_count,
        in_progress_tickets=in_prog_count,
        resolved_tickets=resolved_count,
        breached_tickets=breached_count,
        sla_compliance_rate=compliance_rate,
        avg_resolution_time_hours=avg_res_time,
        priority_distribution=priority_dist,
        category_distribution=category_dist,
    )
