import React from 'react';
import { X, BarChart3, ShieldCheck, AlertTriangle, Clock, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AnalyticsModal({ isOpen, onClose, analytics, onRefresh, isLoading }) {
  if (!isOpen) return null;

  const compliance = analytics?.sla_compliance_rate ?? 100;
  const isHealthy = compliance >= 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl shadow-cyan-950/40 overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">SLA Compliance & Incident Analytics</h3>
              <p className="text-slate-400 text-xs">Live aggregated metrics computed from MongoDB document store</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Refresh metrics"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Hero KPI: SLA Compliance Score */}
          <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isHealthy
              ? 'bg-emerald-950/20 border-emerald-800/50'
              : 'bg-red-950/20 border-red-800/50'
          }`}>
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-xl border ${
                isHealthy ? 'bg-emerald-900/30 border-emerald-700/60 text-emerald-400' : 'bg-red-900/30 border-red-700/60 text-red-400'
              }`}>
                {isHealthy ? <ShieldCheck className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Global SLA Compliance Rate
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className={`text-3xl font-extrabold ${isHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
                    {compliance}%
                  </span>
                  <span className="text-slate-400 font-medium">
                    {isHealthy ? 'Target (>85%) Met' : 'Action Needed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="w-full sm:w-48 space-y-1">
              <div className="h-3 w-full bg-slate-850 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isHealthy ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${compliance}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0%</span>
                <span>Target: 85%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* 4 Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750">
              <span className="text-slate-400 text-[11px] font-medium block">Total Incidents</span>
              <span className="text-xl font-bold text-white mt-1 block">
                {analytics?.total_tickets ?? 0}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Lifetime recorded</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750">
              <span className="text-slate-400 text-[11px] font-medium block">Active Queue</span>
              <span className="text-xl font-bold text-cyan-400 mt-1 block">
                {(analytics?.open_tickets ?? 0) + (analytics?.in_progress_tickets ?? 0)}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {analytics?.open_tickets ?? 0} open, {analytics?.in_progress_tickets ?? 0} in progress
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750">
              <span className="text-slate-400 text-[11px] font-medium block">SLA Breaches</span>
              <span className="text-xl font-bold text-red-400 mt-1 block">
                {analytics?.breached_tickets ?? 0}
              </span>
              <span className="text-[10px] text-red-400/80 mt-0.5 block">Overdue deadline</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750">
              <span className="text-slate-400 text-[11px] font-medium block">Avg Resolution Time</span>
              <span className="text-xl font-bold text-indigo-300 mt-1 block">
                {analytics?.avg_resolution_time_hours ?? 0}h
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Resolved incidents</span>
            </div>
          </div>

          {/* Breakdown Distributions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Priority Breakdown */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2.5">
              <h4 className="font-semibold text-slate-200">Priority Distribution</h4>
              <div className="space-y-2">
                {analytics?.priority_distribution &&
                  Object.entries(analytics.priority_distribution).map(([pri, cnt]) => {
                    const total = analytics.total_tickets || 1;
                    const pct = Math.round((cnt / total) * 100);
                    return (
                      <div key={pri} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="capitalize text-slate-300 font-medium">{pri}</span>
                          <span className="text-slate-400 font-mono">{cnt} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pri === 'critical' ? 'bg-red-500' :
                              pri === 'high' ? 'bg-orange-500' :
                              pri === 'medium' ? 'bg-amber-500' : 'bg-slate-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2.5">
              <h4 className="font-semibold text-slate-200">Category Volume</h4>
              <div className="space-y-2">
                {analytics?.category_distribution &&
                  Object.entries(analytics.category_distribution).map(([cat, cnt]) => {
                    const total = analytics.total_tickets || 1;
                    const pct = Math.round((cnt / total) * 100);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="capitalize text-slate-300 font-medium">
                            {cat.replace('_', ' ')}
                          </span>
                          <span className="text-slate-400 font-mono">{cnt} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-cyan-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
