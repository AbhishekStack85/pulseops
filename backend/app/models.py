from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid

class TicketPriority(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class TicketCategory(str, Enum):
    BILLING = "billing"
    TECHNICAL = "technical"
    ACCOUNT = "account"
    FEATURE_REQUEST = "feature_request"
    OTHER = "other"

class MessageRole(str, Enum):
    CUSTOMER = "customer"
    AGENT = "agent"
    SYSTEM = "system"

class TicketMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_name: str
    role: MessageRole
    content: str
    is_internal: bool = False
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class TicketCreate(BaseModel):
    customer_name: str
    customer_email: str
    category: TicketCategory
    subject: str
    description: str
    priority: Optional[TicketPriority] = None  # If None, auto-triage determines it
    assigned_to: Optional[str] = "Unassigned"

class TicketStatusUpdate(BaseModel):
    status: TicketStatus
    agent_name: Optional[str] = "Support Agent"
    note: Optional[str] = None

class MessageCreateRequest(BaseModel):
    sender_name: str
    role: MessageRole = MessageRole.AGENT
    content: str
    is_internal: bool = False

class TicketResponse(BaseModel):
    id: str
    ticket_number: str
    customer_name: str
    customer_email: str
    category: TicketCategory
    priority: TicketPriority
    status: TicketStatus
    subject: str
    description: str
    assigned_to: str
    sla_target_hours: float
    sla_deadline: str
    is_breached: bool = False
    remaining_seconds: float = 0.0
    created_at: str
    updated_at: str
    resolved_at: Optional[str] = None
    messages: List[TicketMessage] = []
    tags: List[str] = []

class AnalyticsSummary(BaseModel):
    total_tickets: int
    open_tickets: int
    in_progress_tickets: int
    resolved_tickets: int
    breached_tickets: int
    sla_compliance_rate: float
    avg_resolution_time_hours: float
    priority_distribution: Dict[str, int]
    category_distribution: Dict[str, int]
