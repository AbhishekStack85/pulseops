import React, { useState } from 'react';
import {
  Send,
  Lock,
  User,
  Shield,
  CheckCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Tag,
  AlertOctagon,
  CornerDownRight,
} from 'lucide-react';
import SlaBadge from './SlaBadge';

export default function TicketDetail({
  ticket,
  onStatusUpdate,
  onSendMessage,
  isUpdating,
}) {
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [agentName, setAgentName] = useState('Alex (Support Lead)');

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500 bg-slate-950/30">
        <AlertOctagon className="w-12 h-12 mb-3 text-slate-700" />
        <h3 className="text-sm font-semibold text-slate-400">No Ticket Selected</h3>
        <p className="text-xs text-slate-600 mt-1 max-w-sm">
          Select an incident from the queue on the left to inspect conversation history, triage SLA, or reply to the customer.
        </p>
      </div>
    );
  }

  const handleSend = (e) => {
    e?.preventDefault();
    if (!replyText.trim()) return;

    onSendMessage({
      sender_name: agentName,
      role: 'agent',
      content: replyText.trim(),
      is_internal: isInternal,
    });
    setReplyText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSend();
    }
  };

  const applyCannedResponse = (text) => {
    setReplyText(text);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 backdrop-blur space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold text-cyan-400">
                {ticket.ticket_number}
              </span>
              <span className="capitalize px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {ticket.category.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-500">
                • Created {new Date(ticket.created_at).toLocaleString()}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {ticket.subject}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="font-medium text-slate-200">{ticket.customer_name}</span>
              <span>&lt;{ticket.customer_email}&gt;</span>
              <span>• Assigned to: <strong className="text-slate-300">{ticket.assigned_to}</strong></span>
            </div>
          </div>

          {/* Right Action & SLA state */}
          <div className="flex flex-col items-end gap-2">
            <SlaBadge ticket={ticket} />
            <div className="flex items-center gap-2">
              {ticket.status === 'open' && (
                <button
                  disabled={isUpdating}
                  onClick={() => onStatusUpdate('in_progress', 'Agent acknowledged ticket')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
                >
                  Start Working
                </button>
              )}

              {ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
                <button
                  disabled={isUpdating}
                  onClick={() => onStatusUpdate('resolved', 'Issue resolved and verified')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              ) : (
                <button
                  disabled={isUpdating}
                  onClick={() => onStatusUpdate('open', 'Ticket reopened by staff')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reopen Ticket</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tags & SLA target detail row */}
        <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-slate-800/60 text-slate-400">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">Auto-Triage Tags:</span>
            {ticket.tags && ticket.tags.length > 0 ? (
              ticket.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded bg-slate-800/80 text-[10px] text-cyan-300 font-mono border border-slate-700/50"
                >
                  #{tag}
                </span>
              ))
            ) : (
              <span className="text-slate-500 text-[11px]">None</span>
            )}
          </div>

          <div className="text-slate-400 text-[11px]">
            SLA Window: <span className="font-semibold text-slate-200">{ticket.sla_target_hours}h</span> •
            Deadline: <span className="font-mono text-slate-300">{new Date(ticket.sla_deadline).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {ticket.messages && ticket.messages.map((msg, idx) => {
          const isStaff = msg.role === 'agent' || msg.role === 'system';
          const isNote = msg.is_internal;

          return (
            <div
              key={msg.id || idx}
              className={`flex flex-col ${
                isNote
                  ? 'items-stretch'
                  : isStaff
                  ? 'items-end'
                  : 'items-start'
              }`}
            >
              {isNote ? (
                /* Internal Note Banner */
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs my-1">
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Lock className="w-3.5 h-3.5" />
                      Internal Staff Note • {msg.sender_name}
                    </span>
                    <span className="text-[10px] text-amber-500">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              ) : (
                /* Standard Message */
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-xl p-3.5 text-xs ${
                    isStaff
                      ? 'bg-gradient-to-br from-indigo-900/60 to-slate-800 border border-indigo-700/40 text-slate-100 shadow-sm'
                      : 'bg-slate-800/90 border border-slate-700 text-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-slate-700/50">
                    <span className="font-semibold text-slate-300 flex items-center gap-1">
                      {isStaff ? (
                        <Shield className="w-3 h-3 text-cyan-400 inline" />
                      ) : (
                        <User className="w-3 h-3 text-slate-400 inline" />
                      )}
                      {msg.sender_name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reply Workspace */}
      <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur space-y-2">
        {/* Quick Canned Responses */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <span className="text-slate-500 flex items-center gap-1 text-[10px] uppercase font-semibold">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Quick:
          </span>
          <button
            onClick={() => applyCannedResponse("Hi, we are actively investigating this issue right now with our engineering team.")}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 whitespace-nowrap transition"
          >
            Investigating now
          </button>
          <button
            onClick={() => applyCannedResponse("Could you please share the exact timestamp or transaction reference ID for verification?")}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 whitespace-nowrap transition"
          >
            Request Transaction ID
          </button>
          <button
            onClick={() => applyCannedResponse("The fix has been deployed and verified in production. Please try again and let us know!")}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 whitespace-nowrap transition"
          >
            Fix deployed
          </button>
        </div>

        {/* Text Input Container */}
        <div className="relative rounded-lg border border-slate-700 bg-slate-800/90 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition">
          {/* Note toggle header */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-700/60 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsInternal(false)}
                className={`px-2 py-0.5 rounded font-medium transition ${
                  !isInternal ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Reply to Customer
              </button>
              <button
                type="button"
                onClick={() => setIsInternal(true)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded font-medium transition ${
                  isInternal ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3 h-3" />
                Internal Note
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              Posting as: <strong className="text-slate-200">{agentName}</strong>
            </div>
          </div>

          <textarea
            rows={3}
            placeholder={
              isInternal
                ? "Write an internal team note (visible only to staff)..."
                : "Type your response to the customer (Ctrl+Enter to send)..."
            }
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-3 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between p-2 pt-0">
            <span className="text-[10px] text-slate-500">
              Press <kbd className="px-1 py-0.5 bg-slate-900 rounded border border-slate-700">Ctrl+Enter</kbd> to submit
            </span>
            <button
              onClick={handleSend}
              disabled={!replyText.trim() || isUpdating}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold text-white transition disabled:opacity-40 ${
                isInternal ? 'bg-amber-600 hover:bg-amber-500' : 'bg-cyan-600 hover:bg-cyan-500'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isInternal ? 'Post Note' : 'Send Reply'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
