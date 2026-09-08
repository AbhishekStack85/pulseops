const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const WS_BASE = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000/ws";

export async function fetchTickets(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.append("status", filters.status);
  if (filters.priority && filters.priority !== "all") params.append("priority", filters.priority);
  if (filters.category && filters.category !== "all") params.append("category", filters.category);
  if (filters.search) params.append("search", filters.search);

  const res = await fetch(`${API_BASE}/tickets?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
}

export async function fetchTicket(ticketId) {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}`);
  if (!res.ok) throw new Error("Failed to fetch ticket");
  return res.json();
}

export async function createTicket(ticketData) {
  const res = await fetch(`${API_BASE}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ticketData),
  });
  if (!res.ok) throw new Error("Failed to create ticket");
  return res.json();
}

export async function updateTicketStatus(ticketId, status, note = "") {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, note }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

export async function addTicketMessage(ticketId, message) {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Failed to fetch health");
  return res.json();
}

export function initWebSocket(onEvent, onStateChange) {
  let ws;
  let pingInterval;

  function connect() {
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
      } catch {
        // Ignored for non-json
      }
    };

    ws.onclose = () => {
      if (onStateChange) onStateChange(false);
      clearInterval(pingInterval);
      // Auto-reconnect after 3s
      setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }

  connect();

  return () => {
    clearInterval(pingInterval);
    if (ws) ws.close();
  };
}
