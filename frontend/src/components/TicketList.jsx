import React from 'react';
import { Search, Filter, AlertCircle, CheckCircle2, Clock, Inbox } from 'lucide-react';
import SlaBadge from './SlaBadge';

const PRIORITY_STYLES = {
  critical: { label: 'CRITICAL', badge: 'bg-red-500/20 text-red-300 border-red-500/40', dot: 'bg-red-500' },
  high: { label: 'HIGH', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40', dot: 'bg-orange-500' },
  medium: { label: 'MEDIUM', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', dot: 'bg-amber-500' },
  low: { label: 'LOW', badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40', dot: 'bg-slate-500' },
};

export default function TicketList({
  tickets,
  selectedTicketId,
  onSelectTicket,
  filters,
  onFilterChange,
  isLoading,
}) {
  const statusTabs = [
    { id: 'all', label: 'All' },
    { id: 'open', label: 'Open' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="flex flex-col h-full border-r border-slate-800 bg-slate-900/50">
      {/* Top Controls: Search & Filters */}
      <div className="p-3 border-b border-slate-800 space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tickets, subject, customer..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          />
        </div>

        {/* Status Tab Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/60 rounded-lg border border-slate-800/80">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterChange({ ...filters, status: tab.id })}
              className={`flex-1 py-1 text-xs font-medium rounded-md transition ${
                filters.status === tab.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dropdown Filters for Priority & Category */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <select
              value={filters.priority}
              onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
              className="w-full text-xs py-1 px-2 rounded-md bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex-1">
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
              className="w-full text-xs py-1 px-2 rounded-md bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Categories</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
              <option value="feature_request">Feature Request</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ticket List Scrollable Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
        {isLoading && tickets.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading incident queue...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs font-medium text-slate-400">No tickets found</p>
            <p className="text-[11px] text-slate-600 mt-1">Try adjusting search query or filters</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const isSelected = selectedTicketId === ticket.id;
            const priorityInfo = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.medium;

            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className={`p-3.5 cursor-pointer transition-colors border-l-2 ${
                  isSelected
                    ? 'bg-slate-800/90 border-l-cyan-500'
                    : 'hover:bg-slate-850/50 border-l-transparent'
                }`}
              >
                {/* Header row: Ticket number + Priority pill + SLA Badge */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-300">
                      {ticket.ticket_number}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${priorityInfo.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dot}`} />
                      {priorityInfo.label}
                    </span>
                  </div>
                  <SlaBadge ticket={ticket} />
                </div>

                {/* Subject */}
                <h4 className="text-xs font-semibold text-slate-100 line-clamp-1 mb-1">
                  {ticket.subject}
                </h4>

                {/* Description excerpt */}
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                  {ticket.description}
                </p>

                {/* Footer: Customer name & Category */}
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[140px] text-slate-400">
                    {ticket.customer_name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="capitalize px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] border border-slate-700/50">
                      {ticket.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
