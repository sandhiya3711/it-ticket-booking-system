import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Layers, 
  Clock, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export default function KnowledgeArticleCard({ 
  retrieval, 
  explanation, 
  selectedArticleId, 
  onSelectArticle 
}) {
  const [expandedArticleId, setExpandedArticleId] = useState(null);

  if (!retrieval || !retrieval.ranked_articles) return null;

  const rankedArticles = retrieval.ranked_articles;
  const isReliable = retrieval.is_reliable_match;
  const topScorePct = retrieval.top_percentage || 0;

  const toggleExpand = (articleId) => {
    setExpandedArticleId(expandedArticleId === articleId ? null : articleId);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Retrieved Knowledge Articles ({rankedArticles.length})
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Top Match:</span>
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
            isReliable 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            {topScorePct}% Match
          </span>
        </div>
      </div>

      {/* No Reliable Match Warning Banner if below threshold */}
      {!isReliable && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-lg p-3 text-amber-200 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Low Confidence / No Reliable Article Match</span>
          </div>
          <p className="text-[11px] text-amber-200/90 leading-relaxed">
            The highest scoring article ({rankedArticles[0]?.title}) scored only {topScorePct}%, below the required 40% reliability threshold. 
            This ticket may represent a novel bug, hardware damage, or non-standard request.
          </p>
        </div>
      )}

      {/* Explanation Summary */}
      {explanation && explanation.summary && (
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Match Rationale & Factors
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
            {explanation.summary}
          </p>

          {/* Explainability Breakdown Bars */}
          {explanation.factors && explanation.factors.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
              {explanation.factors.map((factor, idx) => (
                <div key={idx} className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-300 mb-1">
                    <span>{factor.name}</span>
                    <span className="font-mono text-indigo-400">{factor.score !== undefined ? `${factor.score}%` : factor.weight}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {factor.description || factor.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ranked Candidate Articles List */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
          Ranked Candidates
        </div>

        {rankedArticles.map((article, index) => {
          const isSelected = selectedArticleId === article.article_id;
          const isExpanded = expandedArticleId === article.article_id;
          const isTop = index === 0;

          return (
            <div
              key={article.article_id}
              className={`rounded-lg border transition-all duration-150 overflow-hidden ${
                isSelected
                  ? 'bg-indigo-950/30 border-indigo-500/60 shadow-sm shadow-indigo-950/40 ring-1 ring-indigo-500/20'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div 
                className="p-3 flex items-start justify-between gap-3 cursor-pointer"
                onClick={() => onSelectArticle(article.article_id)}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                      {article.article_id}
                    </span>
                    {isTop && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        Top Rank
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {article.application}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white leading-snug line-clamp-1">
                    {article.title}
                  </h4>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{article.category}</span>
                    <span>•</span>
                    <span>{article.subcategory}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> ~{article.estimated_mins} mins
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-xs font-mono font-bold ${
                    article.similarity_percentage >= 65 ? 'text-emerald-400' : 
                    article.similarity_percentage >= 40 ? 'text-indigo-400' : 'text-slate-500'
                  }`}>
                    {article.similarity_percentage}%
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(article.article_id);
                    }}
                    className="mt-1 text-[10px] text-slate-400 hover:text-slate-200 inline-flex items-center gap-0.5"
                  >
                    {isExpanded ? 'Less' : 'Steps'}
                    <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Expandable Steps Section */}
              {isExpanded && (
                <div className="p-3 bg-slate-900/80 border-t border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Standard Resolution Steps
                  </div>
                  <ol className="text-xs text-slate-300 space-y-1.5 pl-2 list-none">
                    {article.resolution_steps?.map((step, sIdx) => (
                      <li key={sIdx} className="leading-relaxed bg-slate-950/50 p-1.5 rounded border border-slate-800/60 font-mono text-[11px]">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
