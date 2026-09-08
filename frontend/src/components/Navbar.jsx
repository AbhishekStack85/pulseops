import React from 'react';
import { Activity, Plus, BarChart3, Radio, Database, ShieldCheck } from 'lucide-react';

export default function Navbar({
  wsConnected,
  dbInfo,
  onOpenNewTicket,
  onOpenAnalytics,
  ticketCount = 0,
  breachedCount = 0,
}) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Live status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold shadow-md shadow-cyan-900/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">PulseOps</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                SLA Triage
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Real-Time Incident Triage & Resolution Hub
            </p>
          </div>
        </div>

        {/* Status badges & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* WebSocket Live Indicator */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              wsConnected
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                : 'bg-amber-950/40 text-amber-400 border-amber-800/50'
            }`}
            title={wsConnected ? 'Real-time WebSocket streaming active' : 'Connecting to real-time feed...'}
          >
            <Radio className={`w-3 h-3 ${wsConnected ? 'animate-pulse text-emerald-400' : 'text-amber-400'}`} />
            <span>{wsConnected ? 'Live Sync' : 'Reconnecting'}</span>
          </div>

          {/* Database indicator */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700"
            title={dbInfo?.info || 'Database status'}
          >
            <Database className="w-3 h-3 text-cyan-400" />
            <span>{dbInfo?.type === 'mongodb' ? 'MongoDB Atlas' : 'Local DB'}</span>
          </div>

          {/* Breached alert indicator */}
          {breachedCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-950/80 text-red-300 border border-red-700">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{breachedCount} Breached</span>
            </div>
          )}

          {/* Analytics button */}
          <button
            onClick={onOpenAnalytics}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 transition shadow-sm"
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          {/* New Ticket button */}
          <button
            onClick={onOpenNewTicket}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-900/30 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>
    </header>
  );
}
