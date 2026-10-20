import React, { useState, useEffect } from 'react';
import { 
  PenTool, 
  Send, 
  ArrowUpRight, 
  HelpCircle, 
  Copy, 
  Check, 
  Clock, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  MessageSquare
} from 'lucide-react';

export default function ResolutionEditor({ 
  draftData, 
  ticketId, 
  isReliable, 
  onResolveTicket, 
  onSubmitFeedback,
  loading 
}) {
  const [editedText, setEditedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    if (draftData?.draft_text) {
      setEditedText(draftData.draft_text);
      setFeedbackGiven(null);
      setActionSuccess(null);
    }
  }, [draftData, ticketId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAction = async (status) => {
    if (!onResolveTicket) return;
    const res = await onResolveTicket(status, editedText);
    if (res?.success) {
      setActionSuccess(status);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const handleFeedback = async (rating, thumbs) => {
    setFeedbackGiven(rating);
    if (onSubmitFeedback) {
      await onSubmitFeedback(rating, thumbs);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Analyst Review & Draft Resolution
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-slate-500" />
            Est: ~{draftData?.estimated_mins || 5} min
          </span>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Action Success Alert Banner */}
      {actionSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-lg p-2.5 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Ticket successfully marked as <strong>{actionSuccess}</strong> and logged to audit table!</span>
        </div>
      )}

      {/* Editor Textarea */}
      <div className="relative">
        <textarea
          rows={11}
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          placeholder="Draft resolution instructions will populate here..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 leading-relaxed font-mono focus:outline-none focus:border-indigo-500 transition-colors resize-y"
        />
        <div className="absolute bottom-2.5 right-3 text-[10px] text-slate-500 font-mono">
          {editedText.length} characters • Human-in-the-loop review
        </div>
      </div>

      {/* Workflow Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary Approve Button */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction('Approved')}
            className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
              isReliable 
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/30' 
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Approve & Send Resolution
          </button>

          {/* Escalate Button */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction('Escalated')}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Escalate to Tier 2
          </button>

          {/* Request Info Button */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction('Requested Info')}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Request More Details
          </button>
        </div>

        {/* Feedback thumbs */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Recommendation accurate?</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleFeedback('accurate', 1)}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                feedbackGiven === 'accurate'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Accurate recommendation"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleFeedback('inaccurate', 0)}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                feedbackGiven === 'inaccurate'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Needs refinement or inaccurate"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
