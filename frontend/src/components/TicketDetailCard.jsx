import React from 'react';
import { 
  User, 
  Clock, 
  AlertTriangle, 
  Layers, 
  Cpu, 
  Code2, 
  Copy, 
  Check, 
  Sparkles 
} from 'lucide-react';

export default function TicketDetailCard({ ticket, normalized }) {
  const [copied, setCopied] = React.useState(false);

  if (!ticket) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
        Select a ticket from the queue to run classification and retrieval.
      </div>
    );
  }

  const handleCopyError = () => {
    if (ticket.error_text) {
      navigator.clipboard.writeText(ticket.error_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur-sm space-y-3">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-white bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
            {ticket.ticket_id}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <strong className="text-slate-200">{ticket.submitter || 'Requester'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            {ticket.created_at ? new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
          </span>
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-200 border border-slate-700">
            {ticket.priority || 'Medium'}
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Issue Description
        </label>
        <p className="text-sm text-slate-200 font-normal leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          {ticket.description}
        </p>
      </div>

      {/* Target Application & Error Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-indigo-400" /> Target Application
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">
              {ticket.application || 'General'}
            </span>
            {normalized?.detected_application && normalized.detected_application !== ticket.application && (
              <span className="text-[10px] text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/50">
                AI detected: {normalized.detected_application}
              </span>
            )}
          </div>
        </div>

        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3 h-3 text-rose-400" /> Error Signature
            </span>
            {ticket.error_text && (
              <button
                onClick={handleCopyError}
                className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          <div className="font-mono text-xs text-rose-300 truncate">
            {ticket.error_text || <span className="text-slate-500 font-sans italic">None reported</span>}
          </div>
        </div>
      </div>

      {/* Normalized Tokens Extraction Pill Preview */}
      {normalized?.tokens && (
        <div className="pt-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Normalized Tokens & Entities ({normalized.token_count})
          </div>
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
            {normalized.tokens.slice(0, 12).map((token, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800/70 text-slate-300 rounded border border-slate-700/60"
              >
                {token}
              </span>
            ))}
            {normalized.tokens.length > 12 && (
              <span className="text-[10px] text-slate-500 px-1 py-0.5">
                +{normalized.tokens.length - 12} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
