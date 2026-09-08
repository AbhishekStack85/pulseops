import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, Flame } from 'lucide-react';

export default function SlaBadge({ ticket }) {
  const { status, sla_deadline, is_breached, resolved_at } = ticket;
  const [remainingSec, setRemainingSec] = useState(() => {
    if (!sla_deadline) return 0;
    const deadline = new Date(sla_deadline).getTime();
    const now = Date.now();
    return Math.floor((deadline - now) / 1000);
  });

  useEffect(() => {
    if (status === 'resolved' || status === 'closed') return;

    const interval = setInterval(() => {
      const deadline = new Date(sla_deadline).getTime();
      const now = Date.now();
      setRemainingSec(Math.floor((deadline - now) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sla_deadline, status]);

  const formatDuration = (totalSeconds) => {
    const absSec = Math.abs(totalSeconds);
    const hours = Math.floor(absSec / 3600);
    const minutes = Math.floor((absSec % 3600) / 60);
    const seconds = absSec % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  // Resolved states
  if (status === 'resolved' || status === 'closed') {
    if (is_breached) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-950/60 text-red-400 border border-red-800/60">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          Breached SLA
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        Resolved in SLA
      </span>
    );
  }

  // Active breached
  if (remainingSec <= 0 || is_breached) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-900/80 text-red-200 border border-red-600 shadow-sm shadow-red-950 animate-pulse-fast">
        <Flame className="w-3.5 h-3.5 text-red-400 animate-bounce" />
        Breached (-{formatDuration(remainingSec)})
      </span>
    );
  }

  // Urgent: Less than 45 minutes remaining
  if (remainingSec < 45 * 60) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/80 text-amber-300 border border-amber-600/80 animate-pulse">
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        Urgent: {formatDuration(remainingSec)} left
      </span>
    );
  }

  // Normal compliant active
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-950/50 text-cyan-300 border border-cyan-800/50">
      <Clock className="w-3.5 h-3.5 text-cyan-400" />
      {formatDuration(remainingSec)} left
    </span>
  );
}
