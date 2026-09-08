import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import NewTicketModal from './components/NewTicketModal';
import AnalyticsModal from './components/AnalyticsModal';
import {
  fetchTickets,
  fetchTicket,
  createTicket,
  updateTicketStatus,
  addTicketMessage,
  fetchAnalytics,
  fetchHealth,
  initWebSocket,
} from './services/api';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: '',
  });

  const [wsConnected, setWsConnected] = useState(false);
  const [dbInfo, setDbInfo] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load tickets based on filters
  const loadTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchTickets(filters);
      setTickets(data);
      if (data.length > 0 && !selectedTicketId) {
        setSelectedTicketId(data[0].id);
      }
    } catch (err) {
      console.error('Error loading tickets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, selectedTicketId]);

  // Load selected ticket details
  const loadSelectedTicket = useCallback(async (id) => {
    if (!id) {
      setSelectedTicket(null);
      return;
    }
    try {
      const data = await fetchTicket(id);
      setSelectedTicket(data);
    } catch (err) {
      console.error('Error loading ticket detail:', err);
    }
  }, []);

  // Load analytics & health
  const loadMeta = useCallback(async () => {
    try {
      const [hData, aData] = await Promise.all([fetchHealth(), fetchAnalytics()]);
      setDbInfo(hData.database);
      setAnalytics(aData);
    } catch (err) {
      console.error('Error loading meta:', err);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [filters]);

  useEffect(() => {
    if (selectedTicketId) {
      loadSelectedTicket(selectedTicketId);
    }
  }, [selectedTicketId, loadSelectedTicket]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  // WebSocket Live Updates
  useEffect(() => {
    const cleanup = initWebSocket(
      (event) => {
        // Real-time event received
        console.log('[WS Event]', event);
        loadTickets();
        loadMeta();
        if (selectedTicketId) {
          loadSelectedTicket(selectedTicketId);
        }
      },
      (isConnected) => {
        setWsConnected(isConnected);
      }
    );

    return cleanup;
  }, [selectedTicketId, loadTickets, loadSelectedTicket, loadMeta]);

  // Action: Create ticket
  const handleCreateTicket = async (payload) => {
    try {
      setIsSubmitting(true);
      const created = await createTicket(payload);
      setIsNewModalOpen(false);
      await loadTickets();
      await loadMeta();
      setSelectedTicketId(created.id);
    } catch (err) {
      alert('Failed to create ticket: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Update status
  const handleStatusUpdate = async (newStatus, note = '') => {
    if (!selectedTicketId) return;
    try {
      setIsUpdating(true);
      await updateTicketStatus(selectedTicketId, newStatus, note);
      await loadSelectedTicket(selectedTicketId);
      await loadTickets();
      await loadMeta();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Action: Send message
  const handleSendMessage = async (msgPayload) => {
    if (!selectedTicketId) return;
    try {
      setIsUpdating(true);
      await addTicketMessage(selectedTicketId, msgPayload);
      await loadSelectedTicket(selectedTicketId);
      await loadTickets();
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const breachedCount = tickets.filter(
    (t) => t.is_breached && t.status !== 'resolved' && t.status !== 'closed'
  ).length;

  return (
    <div className="flex flex-col h-screen bg-[#090d16] text-slate-100 font-sans overflow-hidden">
      {/* Top Navigation */}
      <Navbar
        wsConnected={wsConnected}
        dbInfo={dbInfo}
        onOpenNewTicket={() => setIsNewModalOpen(true)}
        onOpenAnalytics={() => {
          loadMeta();
          setIsAnalyticsOpen(true);
        }}
        ticketCount={tickets.length}
        breachedCount={breachedCount}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Ticket Queue (360px - 440px) */}
        <section className="w-full md:w-[380px] lg:w-[420px] shrink-0 h-full flex flex-col">
          <TicketList
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={(id) => setSelectedTicketId(id)}
            filters={filters}
            onFilterChange={setFilters}
            isLoading={isLoading}
          />
        </section>

        {/* Right Side: Active Incident Detail */}
        <section className="hidden md:flex flex-1 h-full flex-col">
          <TicketDetail
            ticket={selectedTicket}
            onStatusUpdate={handleStatusUpdate}
            onSendMessage={handleSendMessage}
            isUpdating={isUpdating}
          />
        </section>
      </main>

      {/* Modals */}
      <NewTicketModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateTicket}
        isSubmitting={isSubmitting}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        analytics={analytics}
        onRefresh={loadMeta}
        isLoading={isLoading}
      />
    </div>
  );
}
