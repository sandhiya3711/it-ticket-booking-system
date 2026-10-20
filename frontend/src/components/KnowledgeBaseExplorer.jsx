import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Code2, 
  Tag,
  ChevronDown
} from 'lucide-react';

export default function KnowledgeBaseExplorer({ articles = [], categories = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedApp, setSelectedApp] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const applications = Array.from(new Set(articles.map(a => a.application).filter(Boolean)));

  const filteredArticles = articles.filter((article) => {
    if (selectedCategory !== 'All' && article.category !== selectedCategory) return false;
    if (selectedApp !== 'All' && article.application !== selectedApp) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = article.title.toLowerCase().includes(q);
      const matchId = article.article_id.toLowerCase().includes(q);
      const matchKeywords = (article.keywords || []).some(k => k.toLowerCase().includes(q));
      const matchSymptoms = (article.symptoms || []).some(s => s.toLowerCase().includes(q));
      if (!matchTitle && !matchId && !matchKeywords && !matchSymptoms) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Internal Knowledge Base Catalog</h2>
              <p className="text-xs text-slate-400">
                Indexed repository of {articles.length} standard troubleshooting procedures and remediation steps.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              TF-IDF Index Synchronized
            </span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="sm:col-span-6 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by keywords, symptoms, or article title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Applications</option>
              {applications.map((app) => (
                <option key={app} value={app}>{app}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArticles.map((article) => {
          const isExpanded = expandedId === article.article_id;

          return (
            <div
              key={article.article_id}
              className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/60">
                      {article.article_id}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {article.application}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {article.title}
                  </h3>
                </div>

                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" /> ~{article.estimated_mins}m
                </span>
              </div>

              {/* Taxonomy Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded">
                  {article.category}
                </span>
                <span className="text-slate-500">›</span>
                <span className="bg-slate-800/80 text-indigo-300 px-2 py-0.5 rounded">
                  {article.subcategory}
                </span>
              </div>

              {/* Symptoms Preview */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Typical Symptoms
                </div>
                <ul className="text-xs text-slate-400 space-y-0.5 list-disc pl-4">
                  {article.symptoms?.slice(0, 2).map((sym, i) => (
                    <li key={i} className="line-clamp-1">{sym}</li>
                  ))}
                </ul>
              </div>

              {/* Error Codes */}
              {article.error_codes && article.error_codes.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Error Signatures:
                  </span>
                  {article.error_codes.map((code) => (
                    <span key={code} className="text-[10px] font-mono bg-rose-950/40 text-rose-300 border border-rose-900/40 px-1.5 py-0.2 rounded">
                      {code}
                    </span>
                  ))}
                </div>
              )}

              {/* Resolution Steps Expander */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : article.article_id)}
                  className="w-full text-left text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>{isExpanded ? 'Hide Remediation Steps' : 'View Remediation Steps'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="mt-2.5 space-y-1.5 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                    {article.resolution_steps?.map((step, idx) => (
                      <div key={idx} className="text-[11px] text-slate-300 leading-relaxed font-mono">
                        {step}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
