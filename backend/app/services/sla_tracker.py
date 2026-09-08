from datetime import datetime
from typing import Dict, Any

def compute_sla_metrics(ticket_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Enriches raw ticket dictionary with live SLA status:
    - remaining_seconds
    - is_breached
    - resolved duration if completed
    """
    now = datetime.utcnow()
    deadline_str = ticket_data.get("sla_deadline")
    status = ticket_data.get("status", "open")
    resolved_at_str = ticket_data.get("resolved_at")

    if not deadline_str:
        ticket_data["remaining_seconds"] = 0
        ticket_data["is_breached"] = False
        return ticket_data

    # Parse ISO dates (safely handles 'Z' or offset)
    try:
        deadline = datetime.fromisoformat(deadline_str.replace("Z", "+00:00")).replace(tzinfo=None)
    except Exception:
        deadline = datetime.utcnow()

    if status in ["resolved", "closed"] and resolved_at_str:
        try:
            resolved_at = datetime.fromisoformat(resolved_at_str.replace("Z", "+00:00")).replace(tzinfo=None)
            ticket_data["is_breached"] = resolved_at > deadline
            ticket_data["remaining_seconds"] = (deadline - resolved_at).total_seconds()
        except Exception:
            ticket_data["is_breached"] = False
            ticket_data["remaining_seconds"] = 0
    else:
        diff = (deadline - now).total_seconds()
        ticket_data["remaining_seconds"] = diff
        ticket_data["is_breached"] = diff < 0

    return ticket_data
