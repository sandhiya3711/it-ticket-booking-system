import React from 'react';
import { 
  Tag, 
  HelpCircle, 
  CheckCircle2, 
  ChevronDown, 
  BarChart2, 
  Sparkles,
  Edit3
} from 'lucide-react';

export default function ClassificationCard({ 
  classification, 
  categories, 
  selectedCategory, 
  selectedSubcategory, 
  onCategoryChange, 
  onSubcategoryChange 
}) {
  const [isEditing, setIsEditing] = React.useState(false);

  if (!classification) return null;

  const confidencePct = classification.confidence_percentage || 0;
  
  const getConfidenceColor = (pct) => {
    if (pct >= 85) return { bar: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/30' };
    if (pct >= 60) return { bar: 'bg-indigo-500', text: 'text-indigo-400', badge: 'bg-indigo-500/10 border-indigo-500/30' };
    return { bar: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/30' };
  };

  const colors = getConfidenceColor(confidencePct);

  // Get active category object for subcategory list
  const currentCategoryObj = categories.find(c => c.name === selectedCategory);
  const availableSubcategories = currentCategoryObj ? currentCategoryObj.subcategories : [];

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur-sm space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Category & Subcategory Classification
          </h3>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-[11px] font-medium text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Edit3 className="w-3 h-3" />
          {isEditing ? 'Done' : 'Override'}
        </button>
      </div>

      {/* Main Category Display / Editor */}
      {!isEditing ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Assigned Category
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span>{selectedCategory}</span>
              <span className="text-slate-500 font-normal">›</span>
              <span className="text-indigo-300 font-semibold">{selectedSubcategory}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className={`text-xs font-mono font-bold ${colors.text}`}>
                {confidencePct}% Confidence
              </span>
              <div className="w-28 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Category Override Dropdowns */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-indigo-950/20 p-3 rounded-lg border border-indigo-500/30">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Category Override
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                onCategoryChange(e.target.value);
                const newCatObj = categories.find(c => c.name === e.target.value);
                if (newCatObj && newCatObj.subcategories.length > 0) {
                  onSubcategoryChange(newCatObj.subcategories[0]);
                }
              }}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              {categories.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Subcategory Override
            </label>
            <select
              value={selectedSubcategory}
              onChange={(e) => onSubcategoryChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              {availableSubcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* AI Reasoning Callout */}
      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-indigo-400" /> Classification Reasoning
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          {classification.reasoning}
        </p>
      </div>

      {/* Category Rankings Breakdown */}
      {classification.category_rankings && classification.category_rankings.length > 1 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Category Probability Distribution</span>
            <span>Relative Score</span>
          </div>
          <div className="space-y-1">
            {classification.category_rankings.map((cat, i) => {
              const maxScore = classification.category_rankings[0].score || 1;
              const widthPct = Math.max(8, (cat.score / maxScore) * 100);
              const isTop = i === 0;

              return (
                <div key={cat.category} className="flex items-center text-[11px] gap-2">
                  <span className={`w-40 truncate ${isTop ? 'font-semibold text-slate-200' : 'text-slate-400'}`}>
                    {cat.category}
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isTop ? 'bg-indigo-500' : 'bg-slate-600'}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 w-8 text-right">
                    {cat.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
