import asyncio
from datetime import datetime, timedelta
import uuid
import sys
import os

# Add parent directory to sys.path so we can import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import db_manager
from app.models import TicketCategory, TicketPriority, TicketStatus, MessageRole
from app.services.triage_engine import analyze_and_triage

SAMPLE_TICKETS = [
    {
        "customer_name": "Rohan Sharma",
        "customer_email": "rohan@fintechcorp.io",
        "category": TicketCategory.BILLING,
        "subject": "Payment deducted twice and production account suspended!",
        "description": "We were charged $299 twice on our corporate credit card, and right after that our team dashboard got locked with 'Payment Failed'. Our entire team is blocked!",
        "assigned_to": "Ananya (Billing Lead)",
        "status": TicketStatus.OPEN,
        "offset_hours_ago": 1.2, # created 1.2 hours ago
        "messages": [
            {
                "sender_name": "Rohan Sharma",
                "role": MessageRole.CUSTOMER,
                "content": "We were charged $299 twice on our corporate credit card, and right after that our team dashboard got locked with 'Payment Failed'. Our entire team is blocked!"
            }
        ]
    },
    {
        "customer_name": "Sarah Jenkins",
        "customer_email": "sarah@cloudscale.net",
        "category": TicketCategory.TECHNICAL,
        "subject": "500 Internal Server Error on CSV data export API",
        "description": "Our automated nightly ETL pipeline is crashing because the /v2/export endpoint throws 500 error on payloads > 5MB. Production down risk for client reporting.",
        "assigned_to": "Vikram (Backend Core)",
        "status": TicketStatus.IN_PROGRESS,
        "offset_hours_ago": 3.5, # Critical 2h SLA was created 3.5 hours ago -> Breached demonstration!
        "messages": [
            {
                "sender_name": "Sarah Jenkins",
                "role": MessageRole.CUSTOMER,
                "content": "Our automated nightly ETL pipeline is crashing because the /v2/export endpoint throws 500 error on payloads > 5MB. Production down risk for client reporting."
            },
            {
                "sender_name": "Vikram (Backend Core)",
                "role": MessageRole.AGENT,
                "content": "Investigating the memory limits on the worker nodes. We have identified an unhandled OutOfMemory exception on the CSV generator."
            }
        ]
    },
    {
        "customer_name": "Amit Patel",
        "customer_email": "amit.patel@logistix.com",
        "category": TicketCategory.ACCOUNT,
        "subject": "SAML SSO Login failing with gateway timeout error",
        "description": "None of our 45 staff members can login through Okta SSO. Getting 504 Gateway Timeout on callback redirect.",
        "assigned_to": "Vikram (Backend Core)",
        "status": TicketStatus.IN_PROGRESS,
        "offset_hours_ago": 1.0,
        "messages": [
            {
                "sender_name": "Amit Patel",
                "role": MessageRole.CUSTOMER,
                "content": "None of our 45 staff members can login through Okta SSO. Getting 504 Gateway Timeout on callback redirect."
            },
            {
                "sender_name": "Vikram (Backend Core)",
                "role": MessageRole.AGENT,
                "content": "We are rotating the certificate signing key. Should be resolved within 30 minutes."
            }
        ]
    },
    {
        "customer_name": "Elena Rostova",
        "customer_email": "elena@designcraft.studio",
        "category": TicketCategory.TECHNICAL,
        "subject": "How to configure custom webhook retries with exponential backoff?",
        "description": "We are receiving webhook payloads but need to know if the system retries failed delivery attempts if our staging server is temporarily offline.",
        "assigned_to": "Priya (Developer Support)",
        "status": TicketStatus.OPEN,
        "offset_hours_ago": 2.0,
        "messages": [
            {
                "sender_name": "Elena Rostova",
                "role": MessageRole.CUSTOMER,
                "content": "We are receiving webhook payloads but need to know if the system retries failed delivery attempts if our staging server is temporarily offline."
            }
        ]
    },
    {
        "customer_name": "David Miller",
        "customer_email": "david@apexmedia.co",
        "category": TicketCategory.BILLING,
        "subject": "Need updated GST / VAT invoice for Q3 tax filing",
        "description": "Can you please reissue invoice #INV-8821 with our updated company VAT registration number GB99281729?",
        "assigned_to": "Ananya (Billing Lead)",
        "status": TicketStatus.RESOLVED,
        "offset_hours_ago": 6.0,
        "resolved_hours_ago": 4.5,
        "messages": [
            {
                "sender_name": "David Miller",
                "role": MessageRole.CUSTOMER,
                "content": "Can you please reissue invoice #INV-8821 with our updated company VAT registration number GB99281729?"
            },
            {
                "sender_name": "Ananya (Billing Lead)",
                "role": MessageRole.AGENT,
                "content": "Updated invoice has been regenerated and emailed to your billing contact. Marking ticket as resolved."
            }
        ]
    },
    {
        "customer_name": "Karan Mehra",
        "customer_email": "karan@startuppulse.in",
        "category": TicketCategory.FEATURE_REQUEST,
        "subject": "Feature suggestion: Dark mode theme and custom shortcuts",
        "description": "It would be amazing to have a dark mode option for late-night ticket management, and shortcuts like 'E' to resolve and 'J/K' to navigate.",
        "assigned_to": "Unassigned",
        "status": TicketStatus.OPEN,
        "offset_hours_ago": 4.0,
        "messages": [
            {
                "sender_name": "Karan Mehra",
                "role": MessageRole.CUSTOMER,
                "content": "It would be amazing to have a dark mode option for late-night ticket management, and shortcuts like 'E' to resolve and 'J/K' to navigate."
            }
        ]
    }
]

async def seed():
    print("[PulseOps] Connecting to database to seed tickets...")
    await db_manager.connect()

    # Clear existing
    try:
        data = db_manager.tickets._load() if hasattr(db_manager.tickets, "_load") else None
        if data is not None:
            db_manager.tickets._save({"tickets": [], "activity_logs": []})
        else:
            await db_manager.tickets.delete_many({})
            await db_manager.activity_logs.delete_many({})
    except Exception:
        pass

    now = datetime.utcnow()

    for idx, item in enumerate(SAMPLE_TICKETS):
        created_at = now - timedelta(hours=item["offset_hours_ago"])
        priority, sla_hours, deadline_base, tags = analyze_and_triage(
            category=item["category"],
            subject=item["subject"],
            description=item["description"]
        )

        sla_deadline = created_at + timedelta(hours=sla_hours)
        resolved_at = None
        if item.get("resolved_hours_ago"):
            resolved_at = (now - timedelta(hours=item["resolved_hours_ago"])).isoformat()

        is_breached = False
        if resolved_at:
            r_dt = datetime.fromisoformat(resolved_at)
            is_breached = r_dt > sla_deadline
        else:
            is_breached = now > sla_deadline

        ticket_doc = {
            "id": str(uuid.uuid4()),
            "ticket_number": f"PULSE-{101 + idx}",
            "customer_name": item["customer_name"],
            "customer_email": item["customer_email"],
            "category": item["category"].value,
            "priority": priority.value,
            "status": item["status"].value,
            "subject": item["subject"],
            "description": item["description"],
            "assigned_to": item["assigned_to"],
            "sla_target_hours": sla_hours,
            "sla_deadline": sla_deadline.isoformat(),
            "is_breached": is_breached,
            "remaining_seconds": (sla_deadline - now).total_seconds(),
            "created_at": created_at.isoformat(),
            "updated_at": (now - timedelta(minutes=10)).isoformat(),
            "resolved_at": resolved_at,
            "messages": [
                {
                    "id": str(uuid.uuid4()),
                    "sender_name": m["sender_name"],
                    "role": m["role"].value,
                    "content": m["content"],
                    "is_internal": False,
                    "created_at": created_at.isoformat()
                }
                for m in item["messages"]
            ],
            "tags": tags
        }

        await db_manager.tickets.insert_one(ticket_doc)
        print(f"  + Seeded {ticket_doc['ticket_number']}: {ticket_doc['subject'][:45]}... [{priority.value.upper()} | SLA {sla_hours}h]")

    print(f"\n[PulseOps] Seeding complete! {len(SAMPLE_TICKETS)} tickets generated.")
    await db_manager.close()

if __name__ == "__main__":
    asyncio.run(seed())
