import React, { useState } from 'react';
import { X, Sparkles, Send, HelpCircle, ShieldAlert } from 'lucide-react';

export default function NewTicketModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    category: 'billing',
    subject: '',
    description: '',
    priority: '', // Empty means auto-triage!
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.subject || !formData.description) return;

    const payload = {
      ...formData,
      priority: formData.priority || null,
    };
    onSubmit(payload);
  };

  const fillExample = (type) => {
    if (type === 'critical') {
      setFormData({
        customer_name: 'Pooja Verma',
        customer_email: 'pooja@fincorp.com',
        category: 'billing',
        subject: 'Payment failed but amount deducted twice ($199)',
        description: 'We had a critical payment failure on our corporate card during subscription renewal, yet two charges appear on our statement. Immediate refund and account unlock required!',
        priority: '',
      });
    } else if (type === 'technical') {
      setFormData({
        customer_name: 'Rahul Sen',
        customer_email: 'rahul@devops.co',
        category: 'technical',
        subject: '500 internal server error during database backup sync',
        description: 'Production worker nodes keep timing out on nightly backups. System down risk for staging and prod.',
        priority: '',
      });
    } else {
      setFormData({
        customer_name: 'Maria Garcia',
        customer_email: 'maria@agency.com',
        category: 'feature_request',
        subject: 'Request: Slack webhook integration for SLA alerts',
        description: 'Would love to receive channel pings when an SLA breaches or an urgent ticket is raised.',
        priority: '',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl shadow-cyan-950/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-850">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Raise Customer Incident / Ticket
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Smart triage engine will automatically calculate SLA target & priority.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Fill Demo Buttons */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 text-xs">
          <span className="text-slate-500 text-[11px] font-semibold">Demo Presets:</span>
          <button
            type="button"
            onClick={() => fillExample('critical')}
            className="px-2 py-0.5 rounded bg-red-950/70 hover:bg-red-900/70 text-red-300 border border-red-800/60 text-[11px] transition"
          >
            Critical Billing Outage
          </button>
          <button
            type="button"
            onClick={() => fillExample('technical')}
            className="px-2 py-0.5 rounded bg-orange-950/70 hover:bg-orange-900/70 text-orange-300 border border-orange-800/60 text-[11px] transition"
          >
            500 Tech Error
          </button>
          <button
            type="button"
            onClick={() => fillExample('feature')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-[11px] transition"
          >
            Feature Request
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Customer Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Alex Morgan"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Customer Email *</label>
              <input
                required
                type="email"
                placeholder="alex@company.com"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="billing">Billing & Payments</option>
                <option value="technical">Technical Issue</option>
                <option value="account">Account Access / Auth</option>
                <option value="feature_request">Feature Request</option>
                <option value="other">General / Other</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span>Priority Assignment</span>
                <span className="text-[10px] text-cyan-400 font-normal">AI Auto-Triage Default</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">Auto-Detect via NLP Triage Engine</option>
                <option value="critical">Force Critical (2h SLA)</option>
                <option value="high">Force High (4h SLA)</option>
                <option value="medium">Force Medium (12h SLA)</option>
                <option value="low">Force Low (24h SLA)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Subject / Incident Summary *</label>
            <input
              required
              type="text"
              placeholder="e.g. Card charged twice but pro access locked"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Detailed Description *</label>
            <textarea
              required
              rows={4}
              placeholder="Provide exact details or error codes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* Auto-triage explanation note */}
          <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 flex items-start gap-2 text-indigo-300">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Triage Rules:</strong> Words like <em>"charged twice"</em>, <em>"500 internal server error"</em>, or <em>"outage"</em> are automatically triaged as <strong>CRITICAL</strong> with a strict 2-hour SLA response target.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-950 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Triaging...' : 'Submit & Triage'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
