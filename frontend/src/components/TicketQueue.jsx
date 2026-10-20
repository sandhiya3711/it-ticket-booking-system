import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Shuffle,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

export default function TicketQueue({ 
  tickets, 
  selectedTicketId, 
  onSelectTicket, 
  loading 
}) {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filterTabs = [
    { id: 'all', label: 'All', count: tickets.length },
    { id: 'normal', label: 'Normal', count: tickets.filter(t => t.ticket_type === 'normal').length },
    { id: 'paraphrased', label: 'Paraphrased', count: tickets.filter(t => t.ticket_type === 'paraphrased').length },
    { id: 'ambiguous', label: 'Ambiguous', count: tickets.filter(t => t.ticket_type === 'ambiguous').length },
    { id: 'no_match', label: 'No-Match', count: tickets.filter(t => t.ticket_type === 'no_match').length },
  ];

  const filteredTickets = tickets.filter(ticket => {
    if (filterType !== 'all' && ticket.ticket_type !== filterType) return false;
    if (categoryFilter !== 'all' && ticket.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = ticket.ticket_id.toLowerCase().includes(q);
      const matchDesc = ticket.description.toLowerCase().includes(q);
      const matchApp = (ticket.application || '').toLowerCase().includes(q);
      const matchErr = (ticket.error_text || '').toLowerCase().includes(q);
      if (!matchId && !matchDesc && !matchApp && !matchErr) return false;
    }
    return true;
  });

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'High':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Low':
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 className="w-2.5 h-2.5" /> Normal
          </span>
        );
      case 'paraphrased':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
            <Shuffle className="w-2.5 h-2.5" /> Paraphrased
          </span>
        );
      case 'ambiguous':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            <HelpCircle className="w-2.5 h-2.5" /> Ambiguous
          </span>
        );
      case 'no_match':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
            <ShieldAlert className="w-2.5 h-2.5" /> No-Match
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-lg backdrop-blur-sm">
      {/* Header & Search */}
      <div className="p-3 border-b border-slate-800 space-y-2.5 bg-slate-900/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Incoming Queue</h2>
            <span className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
              {filteredTickets.length} / {tickets.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> Auto-sync
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tickets, error codes, apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filterType === tab.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label} <span className="opacity-70 font-mono text-[10px]">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-1.5 space-y-1">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No tickets match your active filter.
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isSelected = selectedTicketId === ticket.ticket_id;
            return (
              <div
                key={ticket.ticket_id}
                onClick={() => onSelectTicket(ticket.ticket_id)}
                className={`p-3 rounded-lg transition-all duration-150 cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/30 border-transparent hover:bg-slate-800/40 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-200">
                      {ticket.ticket_id}
                    </span>
                    {getTypeBadge(ticket.ticket_type)}
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getPriorityStyle(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium line-clamp-2 mb-2 leading-relaxed">
                  {ticket.description}
                </p>

                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 font-medium border border-slate-700/50">
                    {ticket.application}
                  </span>

                  {ticket.error_text && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-300 font-mono border border-rose-900/40 truncate max-w-[140px]">
                      {ticket.error_text}
                    </span>
                  )}

                  {ticket.resolution_status && ticket.resolution_status !== 'Open' && (
                    <span className="ml-auto px-1.5 py-0.5 rounded font-semibold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ✓ {ticket.resolution_status}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
