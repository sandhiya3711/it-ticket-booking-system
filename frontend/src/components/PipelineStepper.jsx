import React from 'react';
import { 
  FileText, 
  Binary, 
  Tag, 
  Search, 
  ArrowDownNarrowWide, 
  HelpCircle, 
  PenTool, 
  CheckCircle2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function PipelineStepper({ activeStageIndex, onSelectStage, pipelineData }) {
  const stages = [
    { id: 0, key: 'ticket', label: 'Ticket', icon: FileText, desc: 'Raw submission' },
    { id: 1, key: 'normalize', label: 'Normalize', icon: Binary, desc: 'Clean & tokens' },
    { id: 2, key: 'classify', label: 'Classify', icon: Tag, desc: 'Category & Sub' },
    { id: 3, key: 'retrieve', label: 'Retrieve', icon: Search, desc: 'TF-IDF search' },
    { id: 4, key: 'rank', label: 'Rank', icon: ArrowDownNarrowWide, desc: 'Hybrid scoring' },
    { id: 5, key: 'explain', label: 'Explain', icon: HelpCircle, desc: 'Match reasoning' },
    { id: 6, key: 'draft', label: 'Draft', icon: PenTool, desc: 'Agent proposal' },
  ];

  const isReliable = pipelineData?.summary?.is_reliable_match;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 shadow-md backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Processing Pipeline</span>
          <span className="text-[10px] text-slate-500 font-medium">Click any node to inspect data layer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono">Status:</span>
          {isReliable ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" /> Reliable Match
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Sparkles className="w-3 h-3" /> Review / No Match
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isCurrent = activeStageIndex === idx;
          const isCompleted = true; // All steps ran in pipeline

          return (
            <button
              key={stage.id}
              onClick={() => onSelectStage(idx)}
              className={`group relative text-left p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                isCurrent
                  ? 'bg-indigo-600/20 border-indigo-500/60 shadow-sm shadow-indigo-500/20 ring-1 ring-indigo-500/30'
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold font-mono ${isCurrent ? 'text-indigo-300' : 'text-slate-500'}`}>
                  0{idx + 1}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
              </div>
              <div className={`text-xs font-semibold truncate ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                {stage.label}
              </div>
              <div className="text-[10px] text-slate-500 truncate hidden md:block">
                {stage.desc}
              </div>

              {/* Step indicator dot */}
              <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-all ${
                isCurrent ? 'bg-indigo-400 scale-125' : 'bg-transparent'
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
