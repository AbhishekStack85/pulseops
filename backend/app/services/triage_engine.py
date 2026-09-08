from datetime import datetime, timedelta
import re
from typing import Tuple, List
from app.models import TicketCategory, TicketPriority
from app.config import settings

CRITICAL_KEYWORDS = [
    r"\b(payment\s*fail(ed|ure)?)\b",
    r"\b(charged\s*(twice|double))\b",
    r"\b(unauthorized\s*charge)\b",
    r"\b(outage|down|crash(ed)?)\b",
    r"\b(data\s*loss|lost\s*data)\b",
    r"\b(security\s*breach|vulnerability|hacked)\b",
    r"\b(500\s*internal\s*server\s*error)\b",
    r"\b(production\s*down)\b",
]

HIGH_KEYWORDS = [
    r"\b(cannot\s*log\s*in|login\s*fail(ed)?)\b",
    r"\b(account\s*lock(ed)?)\b",
    r"\b(api\s*(error|broken))\b",
    r"\b(critical|urgent|asap)\b",
    r"\b(timeout|gateway\s*error)\b",
]

LOW_KEYWORDS = [
    r"\b(feature\s*request|suggestion|idea)\b",
    r"\b(typo|spelling|cosmetic)\b",
    r"\b(dark\s*mode|color\s*scheme)\b",
    r"\b(docs|documentation\s*update)\b",
]

def analyze_and_triage(
    category: TicketCategory,
    subject: str,
    description: str,
    manual_priority: TicketPriority | None = None
) -> Tuple[TicketPriority, float, datetime, List[str]]:
    """
    Intelligently determines the ticket priority, SLA target hours,
    deadline timestamp, and semantic tags.
    """
    text = f"{subject} {description}".lower()
    tags = [category.value]

    if manual_priority:
        priority = manual_priority
        tags.append("manual-override")
    else:
        # Rule 1: Category defaults
        if category == TicketCategory.BILLING:
            priority = TicketPriority.HIGH
        elif category == TicketCategory.FEATURE_REQUEST:
            priority = TicketPriority.LOW
        else:
            priority = TicketPriority.MEDIUM

        # Rule 2: Keyword pattern scanning
        for pattern in CRITICAL_KEYWORDS:
            if re.search(pattern, text):
                priority = TicketPriority.CRITICAL
                tags.append("critical-keyword")
                break

        if priority != TicketPriority.CRITICAL:
            for pattern in HIGH_KEYWORDS:
                if re.search(pattern, text):
                    priority = TicketPriority.HIGH
                    tags.append("high-keyword")
                    break

        if priority not in [TicketPriority.CRITICAL, TicketPriority.HIGH]:
            for pattern in LOW_KEYWORDS:
                if re.search(pattern, text):
                    priority = TicketPriority.LOW
                    tags.append("low-keyword")
                    break

    target_hours = settings.SLA_TARGET_HOURS.get(priority.value, 12.0)
    now = datetime.utcnow()
    deadline = now + timedelta(hours=target_hours)

    return priority, target_hours, deadline, tags
