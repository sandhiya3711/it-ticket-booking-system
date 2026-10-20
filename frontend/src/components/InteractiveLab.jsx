import React, { useState } from 'react';
import { 
  FlaskConical, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Tag, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  Code2
} from 'lucide-react';

export default function InteractiveLab({ onProcessCustomTicket, applications }) {
  const [description, setDescription] = useState('');
  const [application, setApplication] = useState('General / Unassigned');
  const [errorText, setErrorText] = useState('');
  const [submitter, setSubmitter] = useState('Taylor Swift (Creative)');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const presets = [
    {
      title: 'Normal Match',
      type: 'normal',
      app: 'NovaMail',
      error: 'AUTH-403 Account Disabled Temporarily',
      desc: 'My NovaMail account has been locked after typing incorrect credentials three times. Please assist.',
    },
    {
      title: 'Paraphrased Phrasing',
      type: 'paraphrased',
      app: 'Orion HR Portal',
      error: 'AUTH-401-INVALID-PASS',
      desc: 'I cannot get into the HR portal because my credentials are no longer accepted and it says info is out of date.',
    },
    {
      title: 'Ambiguous Query',
      type: 'ambiguous',
      app: 'CloudDesk',
      error: '',
      desc: 'The application is not working and freezes on my screen.',
    },
    {
      title: 'No-Match: Liquid Damage',
      type: 'no_match',
      app: 'Hardware',
      error: 'HARDWARE_LIQUID_SUBMERSION',
      desc: 'Spilled a large cup of hot coffee directly into the laptop keyboard vents. Machine sparked and won\'t boot.',
    },
    {
      title: 'No-Match: Crypto Plugin',
      type: 'no_match',
      app: 'General / Unassigned',
      error: 'UNSUPPORTED_CHAIN_ID',
      desc: 'Need local setup instructions for custom Ethereum private testnet RPC node and smart contract debugger.',
    }
  ];

  const handleApplyPreset = (preset) => {
    setDescription(preset.desc);
    setApplication(preset.app);
    setErrorText(preset.error);
  };

  const handleRunPipeline = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      const data = await onProcessCustomTicket({
        description,
        application,
        error_text: errorText,
        submitter,
        priority
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900/60 border border-indigo-500/30 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Interactive AI Pipeline Test Lab</h2>
            <p className="text-xs text-slate-400">
              Test arbitrary inputs, colloquial phrasing, ambiguous requests, and unmatchable tickets in real-time.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Load Evaluation Presets
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>{preset.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Form Input */}
        <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
            Custom Ticket Parameters
          </h3>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Issue Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter user issue description in natural or colloquial language..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Declared Application
              </label>
              <select
                value={application}
                onChange={(e) => setApplication(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="General / Unassigned">General / Auto-Detect</option>
                {applications.map((app) => (
                  <option key={app} value={app}>{app}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Error Signature / Text
              </label>
              <input
                type="text"
                value={errorText}
                onChange={(e) => setErrorText(e.target.value)}
                placeholder="e.g. AUTH-403, 0xC0000005"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setDescription('');
                setErrorText('');
                setResult(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </button>

            <button
              type="button"
              disabled={loading || !description.trim()}
              onClick={handleRunPipeline}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {loading ? 'Processing Pipeline...' : 'Run 7-Stage Pipeline'}
            </button>
          </div>
        </div>

        {/* Right Column: Stage Inspection Results */}
        <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800 flex items-center justify-between">
            <span>Pipeline Execution Inspection</span>
            {result && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                result.summary.is_reliable_match
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {result.summary.status}
              </span>
            )}
          </h3>

          {!result ? (
            <div className="p-12 text-center text-slate-500 text-xs space-y-2">
              <FlaskConical className="w-8 h-8 text-slate-600 mx-auto stroke-[1.5]" />
              <p>Apply a preset or enter ticket details to trace intermediate representations through all 7 stages.</p>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Normalized Stage Box */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-400 text-[10px] uppercase">
                  <span>Stage 1: Normalization & Entities</span>
                  <span className="text-indigo-400">{result.stages.stage_1_normalized.token_count} tokens</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.stages.stage_1_normalized.tokens.map((token, i) => (
                    <span key={i} className="font-mono text-[10px] bg-slate-800/80 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/60">
                      {token}
                    </span>
                  ))}
                </div>
                {result.stages.stage_1_normalized.extracted_error_codes.length > 0 && (
                  <div className="text-[11px] text-rose-400 font-mono">
                    Extracted Codes: {result.stages.stage_1_normalized.extracted_error_codes.join(', ')}
                  </div>
                )}
              </div>

              {/* Classification Stage Box */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-400 text-[10px] uppercase">
                  <span>Stage 2: Category Routing</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {result.stages.stage_2_classification.confidence_percentage}% Confidence
                  </span>
                </div>
                <div className="text-sm font-bold text-white">
                  {result.stages.stage_2_classification.predicted_category} › {result.stages.stage_2_classification.predicted_subcategory}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {result.stages.stage_2_classification.reasoning}
                </p>
              </div>

              {/* Retrieval & Ranking Stage Box */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-400 text-[10px] uppercase">
                  <span>Stage 3 & 4: Hybrid Retrieval & Ranking</span>
                  <span className="font-mono font-bold text-indigo-400">
                    Top Score: {result.summary.top_match_pct}%
                  </span>
                </div>
                {result.stages.stage_3_retrieval.top_article ? (
                  <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[10px] text-slate-500">
                        {result.stages.stage_3_retrieval.top_article.article_id}
                      </div>
                      <div className="font-semibold text-slate-200">
                        {result.stages.stage_3_retrieval.top_article.title}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {result.stages.stage_3_retrieval.top_article.similarity_percentage}%
                    </span>
                  </div>
                ) : (
                  <div className="text-rose-400 font-medium">No matching articles in catalog.</div>
                )}
              </div>

              {/* Draft Resolution Stage Box */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-400 text-[10px] uppercase">
                  <span>Stage 5: Generated Resolution Draft</span>
                  <span className="text-slate-500 font-mono">Ready for analyst</span>
                </div>
                <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap bg-slate-900/60 p-2.5 rounded border border-slate-800/80 max-h-48 overflow-y-auto leading-relaxed">
                  {result.stages.stage_5_draft.draft_text}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
