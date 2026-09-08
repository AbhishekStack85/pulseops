const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const WS_BASE = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000/ws";

// Fallback seed tickets if backend is offline or on Vercel
const DEMO_TICKETS_KEY = "pulseops_demo_tickets_v1";

function getInitialDemoTickets() {
  const now = new Date();
  return [
    {
      id: "demo-1",
      ticket_number: "PULSE-101",
      customer_name: "Rohan Sharma",
      customer_email: "rohan@fintechcorp.io",
      category: "billing",
      priority: "critical",
      status: "open",
      subject: "Payment deducted twice and production account suspended!",
      description: "We were charged $299 twice on our corporate credit card, and right after that our team dashboard got locked with 'Payment Failed'. Our entire team is blocked!",
      assigned_to: "Ananya (Billing Lead)",
      sla_target_hours: 2.0,
      sla_deadline: new Date(now.getTime() + 48 * 60 * 1000).toISOString(), // 48m left
      is_breached: false,
      remaining_seconds: 48 * 60,
      created_at: new Date(now.getTime() - 72 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      resolved_at: null,
      tags: ["billing", "critical-keyword"],
      messages: [
        {
          id: "m1",
          sender_name: "Rohan Sharma",
          role: "customer",
          content: "We were charged $299 twice on our corporate credit card, and right after that our team dashboard got locked with 'Payment Failed'. Our entire team is blocked!",
          is_internal: false,
          created_at: new Date(now.getTime() - 72 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: "demo-2",
      ticket_number: "PULSE-102",
      customer_name: "Sarah Jenkins",
      customer_email: "sarah@cloudscale.net",
      category: "technical",
      priority: "critical",
      status: "in_progress",
      subject: "500 Internal Server Error on CSV data export API",
      description: "Our automated nightly ETL pipeline is crashing because the /v2/export endpoint throws 500 error on payloads > 5MB. Production down risk for client reporting.",
      assigned_to: "Vikram (Backend Core)",
      sla_target_hours: 2.0,
      sla_deadline: new Date(now.getTime() - 25 * 60 * 1000).toISOString(), // Breached by 25m
      is_breached: true,
      remaining_seconds: -25 * 60,
      created_at: new Date(now.getTime() - 145 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      resolved_at: null,
      tags: ["technical", "critical-keyword"],
      messages: [
        {
          id: "m2",
          sender_name: "Sarah Jenkins",
          role: "customer",
          content: "Our automated nightly ETL pipeline is crashing because the /v2/export endpoint throws 500 error on payloads > 5MB. Production down risk for client reporting.",
          is_internal: false,
          created_at: new Date(now.getTime() - 145 * 60 * 1000).toISOString(),
        },
        {
          id: "m3",
          sender_name: "Vikram (Backend Core)",
          role: "agent",
          content: "Investigating worker nodes. We have identified an unhandled OutOfMemory exception during chunking.",
          is_internal: false,
          created_at: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: "demo-3",
      ticket_number: "PULSE-103",
      customer_name: "Amit Patel",
      customer_email: "amit.patel@logistix.com",
      category: "account",
      priority: "high",
      status: "in_progress",
      subject: "SAML SSO Login failing with gateway timeout error",
      description: "None of our 45 staff members can login through Okta SSO. Getting 504 Gateway Timeout on callback redirect.",
      assigned_to: "Vikram (Backend Core)",
      sla_target_hours: 4.0,
      sla_deadline: new Date(now.getTime() + 150 * 60 * 1000).toISOString(),
      is_breached: false,
      remaining_seconds: 150 * 60,
      created_at: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      resolved_at: null,
      tags: ["account", "high-keyword"],
      messages: [
        {
          id: "m4",
          sender_name: "Amit Patel",
          role: "customer",
          content: "None of our 45 staff members can login through Okta SSO. Getting 504 Gateway Timeout on callback redirect.",
          is_internal: false,
          created_at: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: "demo-4",
      ticket_number: "PULSE-104",
      customer_name: "Elena Rostova",
      customer_email: "elena@designcraft.studio",
      category: "technical",
      priority: "medium",
      status: "open",
      subject: "How to configure custom webhook retries with exponential backoff?",
      description: "We are receiving webhook payloads but need to know if the system retries failed delivery attempts if our staging server is temporarily offline.",
      assigned_to: "Priya (Developer Support)",
      sla_target_hours: 12.0,
      sla_deadline: new Date(now.getTime() + 540 * 60 * 1000).toISOString(),
      is_breached: false,
      remaining_seconds: 540 * 60,
      created_at: new Date(now.getTime() - 180 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      resolved_at: null,
      tags: ["technical"],
      messages: [
        {
          id: "m5",
          sender_name: "Elena Rostova",
          role: "customer",
          content: "We are receiving webhook payloads but need to know if the system retries failed delivery attempts if our staging server is temporarily offline.",
          is_internal: false,
          created_at: new Date(now.getTime() - 180 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: "demo-5",
      ticket_number: "PULSE-105",
      customer_name: "David Miller",
      customer_email: "david@apexmedia.co",
      category: "billing",
      priority: "high",
      status: "resolved",
      subject: "Need updated GST / VAT invoice for Q3 tax filing",
      description: "Can you please reissue invoice #INV-8821 with our updated company VAT registration number GB99281729?",
      assigned_to: "Ananya (Billing Lead)",
      sla_target_hours: 4.0,
      sla_deadline: new Date(now.getTime() - 120 * 60 * 1000).toISOString(),
      is_breached: false,
      remaining_seconds: 7200,
      created_at: new Date(now.getTime() - 360 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      resolved_at: new Date(now.getTime() - 240 * 60 * 1000).toISOString(),
      tags: ["billing"],
      messages: [
        {
          id: "m6",
          sender_name: "David Miller",
          role: "customer",
          content: "Can you please reissue invoice #INV-8821 with our updated company VAT registration number GB99281729?",
          is_internal: false,
          created_at: new Date(now.getTime() - 360 * 60 * 1000).toISOString(),
        },
        {
          id: "m7",
          sender_name: "Ananya (Billing Lead)",
          role: "agent",
          content: "Updated invoice regenerated and dispatched. Resolving incident.",
          is_internal: false,
          created_at: new Date(now.getTime() - 240 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: "demo-6",
      ticket_number: "PULSE-106",
      customer_name: "Karan Mehra",
      customer_email: "karan@startuppulse.in",
      category: "feature_request",
      priority: "low",
      status: "open",
      subject: "Feature suggestion: Dark mode theme and custom keyboard shortcuts",
      description: "It would be amazing to have a dark mode option for late-night ticket management, and shortcuts like 'E' to resolve and 'J/K' to navigate.",
      assigned_to: "Unassigned",
      sla_target_hours: 24.0,
      sla_deadline: new Date(now.getTime() + 1100 * 60 * 1000).toISOString(),
      is_breached: false,
      remaining_seconds: 1100 * 60,
      created_at: new Date(now.getTime() - 340 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      resolved_at: null,
      tags: ["feature_request", "low-keyword"],
      messages: [
        {
          id: "m8",
          sender_name: "Karan Mehra",
          role: "customer",
          content: "It would be amazing to have a dark mode option for late-night ticket management, and shortcuts like 'E' to resolve and 'J/K' to navigate.",
          is_internal: false,
          created_at: new Date(now.getTime() - 340 * 60 * 1000).toISOString(),
        },
      ],
    },
  ];
}

function getStoredTickets() {
  try {
    const raw = localStorage.getItem(DEMO_TICKETS_KEY);
    if (!raw) {
      const initial = getInitialDemoTickets();
      localStorage.setItem(DEMO_TICKETS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialDemoTickets();
  }
}

function saveStoredTickets(tickets) {
  try {
    localStorage.setItem(DEMO_TICKETS_KEY, JSON.stringify(tickets));
  } catch {}
}

export async function fetchTickets(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "all") params.append("status", filters.status);
    if (filters.priority && filters.priority !== "all") params.append("priority", filters.priority);
    if (filters.category && filters.category !== "all") params.append("category", filters.category);
    if (filters.search) params.append("search", filters.search);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE}/tickets?${params.toString()}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) return await res.json();
  } catch (e) {
    // Graceful fallback to client-side store
  }

  // Filter local store
  let tickets = getStoredTickets();
  if (filters.status && filters.status !== "all") {
    tickets = tickets.filter((t) => t.status === filters.status);
  }
  if (filters.priority && filters.priority !== "all") {
    tickets = tickets.filter((t) => t.priority === filters.priority);
  }
  if (filters.category && filters.category !== "all") {
    tickets = tickets.filter((t) => t.category === filters.category);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    tickets = tickets.filter(
      (t) =>
        t.ticket_number.toLowerCase().includes(s) ||
        t.subject.toLowerCase().includes(s) ||
        t.customer_name.toLowerCase().includes(s)
    );
  }
  return tickets;
}

export async function fetchTicket(ticketId) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE}/tickets/${ticketId}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) return await res.json();
  } catch (e) {}

  const tickets = getStoredTickets();
  const found = tickets.find((t) => t.id === ticketId);
  if (!found) throw new Error("Ticket not found");
  return found;
}

export async function createTicket(ticketData) {
  try {
    const res = await fetch(`${API_BASE}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticketData),
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  // Local triage simulation
  const text = `${ticketData.subject} ${ticketData.description}`.toLowerCase();
  let priority = ticketData.priority || "medium";
  let slaHours = 12.0;

  if (text.includes("charged") || text.includes("payment fail") || text.includes("outage") || text.includes("500") || text.includes("data loss")) {
    priority = "critical";
    slaHours = 2.0;
  } else if (text.includes("login") || text.includes("lock") || text.includes("error") || text.includes("urgent")) {
    priority = "high";
    slaHours = 4.0;
  } else if (text.includes("feature") || text.includes("dark mode") || text.includes("suggestion")) {
    priority = "low";
    slaHours = 24.0;
  }

  const now = new Date();
  const deadline = new Date(now.getTime() + slaHours * 3600 * 1000);
  const tickets = getStoredTickets();
  const newTicket = {
    id: "demo-" + Date.now(),
    ticket_number: `PULSE-${101 + tickets.length}`,
    customer_name: ticketData.customer_name,
    customer_email: ticketData.customer_email,
    category: ticketData.category,
    priority: priority,
    status: "open",
    subject: ticketData.subject,
    description: ticketData.description,
    assigned_to: "Unassigned",
    sla_target_hours: slaHours,
    sla_deadline: deadline.toISOString(),
    is_breached: false,
    remaining_seconds: slaHours * 3600,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    resolved_at: null,
    tags: [ticketData.category, priority + "-keyword"],
    messages: [
      {
        id: "m-" + Date.now(),
        sender_name: ticketData.customer_name,
        role: "customer",
        content: ticketData.description,
        is_internal: false,
        created_at: now.toISOString(),
      },
    ],
  };

  tickets.unshift(newTicket);
  saveStoredTickets(tickets);
  return newTicket;
}

export async function updateTicketStatus(ticketId, status, note = "") {
  try {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  const tickets = getStoredTickets();
  const idx = tickets.findIndex((t) => t.id === ticketId);
  if (idx !== -1) {
    const now = new Date();
    tickets[idx].status = status;
    tickets[idx].updated_at = now.toISOString();
    if (status === "resolved" || status === "closed") {
      tickets[idx].resolved_at = now.toISOString();
    }
    if (note) {
      tickets[idx].messages.push({
        id: "m-" + Date.now(),
        sender_name: "Support Agent",
        role: "agent",
        content: `Status updated to ${status.toUpperCase()}. Note: ${note}`,
        is_internal: true,
        created_at: now.toISOString(),
      });
    }
    saveStoredTickets(tickets);
    return tickets[idx];
  }
}

export async function addTicketMessage(ticketId, message) {
  try {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  const tickets = getStoredTickets();
  const idx = tickets.findIndex((t) => t.id === ticketId);
  if (idx !== -1) {
    const now = new Date();
    const newMsg = {
      id: "m-" + Date.now(),
      sender_name: message.sender_name,
      role: message.role || "agent",
      content: message.content,
      is_internal: Boolean(message.is_internal),
      created_at: now.toISOString(),
    };
    tickets[idx].messages.push(newMsg);
    if (tickets[idx].status === "open" && message.role === "agent") {
      tickets[idx].status = "in_progress";
    }
    tickets[idx].updated_at = now.toISOString();
    saveStoredTickets(tickets);
    return tickets[idx];
  }
}

export async function fetchAnalytics() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE}/analytics`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) return await res.json();
  } catch (e) {}

  const tickets = getStoredTickets();
  const total = tickets.length;
  const open = tickets.filter((t) => t.status === "open").length;
  const in_progress = tickets.filter((t) => t.status === "in_progress").length;
  const resolved = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;
  const breached = tickets.filter((t) => t.is_breached).length;

  const priDist = { critical: 0, high: 0, medium: 0, low: 0 };
  const catDist = { billing: 0, technical: 0, account: 0, feature_request: 0, other: 0 };

  tickets.forEach((t) => {
    if (priDist[t.priority] !== undefined) priDist[t.priority]++;
    if (catDist[t.category] !== undefined) catDist[t.category]++;
  });

  return {
    total_tickets: total,
    open_tickets: open,
    in_progress_tickets: in_progress,
    resolved_tickets: resolved,
    breached_tickets: breached,
    sla_compliance_rate: total > 0 ? Math.round(((total - breached) / total) * 1000) / 10 : 100,
    avg_resolution_time_hours: 1.8,
    priority_distribution: priDist,
    category_distribution: catDist,
  };
}

export async function fetchHealth() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) return await res.json();
  } catch (e) {}

  return {
    status: "healthy",
    service: "PulseOps (Live Demo Mode)",
    database: {
      type: "cloud_demo",
      connected: true,
      info: "Interactive Demo Engine with Live NLP Triage & SLA Timers",
    },
  };
}

export function initWebSocket(onEvent, onStateChange) {
  let ws;
  let pingInterval;

  try {
    ws = new WebSocket(WS_BASE);

    ws.onopen = () => {
      if (onStateChange) onStateChange(true);
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send("ping");
        }
      }, 15000);
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (onEvent) onEvent(data);
      } catch {}
    };

    ws.onclose = () => {
      if (onStateChange) onStateChange(false);
      clearInterval(pingInterval);
    };

    ws.onerror = () => {
      if (onStateChange) onStateChange(false);
    };
  } catch {
    if (onStateChange) onStateChange(false);
  }

  return () => {
    clearInterval(pingInterval);
    if (ws) ws.close();
  };
}
