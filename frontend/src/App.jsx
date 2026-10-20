import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PipelineStepper from './components/PipelineStepper';
import TicketQueue from './components/TicketQueue';
import TicketDetailCard from './components/TicketDetailCard';
import ClassificationCard from './components/ClassificationCard';
import KnowledgeArticleCard from './components/KnowledgeArticleCard';
import ResolutionEditor from './components/ResolutionEditor';
import InteractiveLab from './components/InteractiveLab';
import KnowledgeBaseExplorer from './components/KnowledgeBaseExplorer';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('queue');
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [pipelineData, setPipelineData] = useState(null);
  const [activeStageIndex, setActiveStageIndex] = useState(6); // Default on Draft step

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Initial load
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [ticketsRes, catsRes, kbRes, analyticsRes] = await Promise.all([
          fetch('/api/tickets').then(r => r.json()),
          fetch('/api/categories').then(r => r.json()),
          fetch('/api/knowledge-base').then(r => r.json()),
          fetch('/api/analytics').then(r => r.json())
        ]);

        setTickets(ticketsRes || []);
        setCategories(catsRes || []);
        setKnowledgeBase(kbRes || []);
        setAnalytics(analyticsRes || null);

        // Select first ticket if available
        if (ticketsRes && ticketsRes.length > 0) {
          const firstId = ticketsRes[0].ticket_id;
          setSelectedTicketId(firstId);
          await processTicket(firstId);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setInitialLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Process ticket through full 7-stage pipeline
  const processTicket = async (ticketId) => {
    setLoading(true);
    try {
      const res = await fetch('/api/pipeline/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId })
      });
      const data = await res.json();
      setPipelineData(data);

      // Initialize analyst overrides with predicted taxonomy
      const predCat = data.stages?.stage_2_classification?.predicted_category || 'General';
      const predSub = data.stages?.stage_2_classification?.predicted_subcategory || 'General Issue';
      setSelectedCategory(predCat);
      setSelectedSubcategory(predSub);

      // Initialize selected article
      const topArticleId = data.stages?.stage_3_retrieval?.top_article?.article_id;
      setSelectedArticleId(topArticleId);
    } catch (err) {
      console.error('Error executing ticket pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = async (ticketId) => {
    setSelectedTicketId(ticketId);
    await processTicket(ticketId);
  };

  // Resolve Ticket Action (Approve / Escalate / Request Info)
  const handleResolveTicket = async (status, finalDraft) => {
    if (!selectedTicketId) return;
    try {
      const res = await fetch('/api/tickets/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: selectedTicketId,
          status,
          approved_category: selectedCategory,
          approved_subcategory: selectedSubcategory,
          selected_kb_id: selectedArticleId,
          final_draft: finalDraft,
          analyst_name: 'Alex Mercer',
          time_saved_minutes: 8
        })
      });
      const result = await res.json();

      // Refresh tickets list and analytics
      const [updatedTickets, updatedAnalytics] = await Promise.all([
        fetch('/api/tickets').then(r => r.json()),
        fetch('/api/analytics').then(r => r.json())
      ]);
      setTickets(updatedTickets);
      setAnalytics(updatedAnalytics);

      return result;
    } catch (err) {
      console.error('Failed to resolve ticket:', err);
    }
  };

  // Submit Feedback
  const handleSubmitFeedback = async (rating, thumbs) => {
    if (!selectedTicketId) return;
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: selectedTicketId,
          rating,
          thumbs,
          comments: ''
        })
      });
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  // Custom ticket execution in lab
  const handleProcessCustomTicket = async (payload) => {
    const res = await fetch('/api/pipeline/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  };

  // Candidate article selection override
  const handleSelectArticle = (articleId) => {
    setSelectedArticleId(articleId);
    const candidate = pipelineData?.stages?.stage_3_retrieval?.ranked_articles?.find(
      a => a.article_id === articleId
    );
    if (candidate) {
      // Update draft with this candidate article's resolution steps
      const submitter = pipelineData?.ticket?.submitter || 'there';
      const firstName = submitter.split(' ')[0];
      const app = candidate.application;
      const steps = candidate.resolution_steps?.join('\n') || '';
      
      const newDraftText = (
        `Hello ${firstName},\n\n` +
        `Thank you for contacting IT Support regarding ${app}.\n\n` +
        `We have identified standard resolution procedures for this issue (${candidate.title}):\n\n` +
        `${steps}\n\n` +
        `Please let us know once you have tested these instructions.\n\n` +
        `Best regards,\nIT Service Desk Analyst\nReference KB: ${candidate.article_id}`
      );

      setPipelineData(prev => ({
        ...prev,
        stages: {
          ...prev.stages,
          stage_5_draft: {
            ...prev.stages.stage_5_draft,
            draft_text: newDraftText,
            source_article_id: candidate.article_id,
            source_article_title: candidate.title,
            estimated_mins: candidate.estimated_mins
          }
        }
      }));
    }
  };

  const applicationsList = Array.from(new Set(knowledgeBase.map(a => a.application).filter(Boolean)));

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium">Initializing IT AMS Assistant Engine & Local Knowledge Index...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={{ pendingCount: tickets.filter(t => t.resolution_status === 'Open').length }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* VIEW 1: TICKET WORKBENCH */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            {/* Visual 7-Stage Stepper */}
            <PipelineStepper
              activeStageIndex={activeStageIndex}
              onSelectStage={setActiveStageIndex}
              pipelineData={pipelineData}
            />

            {/* Split Screen Workbench: Queue + Analysis Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Ticket Queue (4 cols) */}
              <div className="lg:col-span-4 h-[780px]">
                <TicketQueue
                  tickets={tickets}
                  selectedTicketId={selectedTicketId}
                  onSelectTicket={handleSelectTicket}
                  loading={loading}
                />
              </div>

              {/* Right Column: Active Ticket Pipeline Analysis & Review (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                {loading && (
                  <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-xl p-3 text-xs text-indigo-300 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Executing TF-IDF vector retrieval and category scoring...</span>
                  </div>
                )}

                {/* Ticket Details */}
                <TicketDetailCard
                  ticket={pipelineData?.ticket}
                  normalized={pipelineData?.stages?.stage_1_normalized}
                />

                {/* Classification & Taxonomy Override */}
                <ClassificationCard
                  classification={pipelineData?.stages?.stage_2_classification}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  onCategoryChange={setSelectedCategory}
                  onSubcategoryChange={setSelectedSubcategory}
                />

                {/* Retrieved Knowledge Base Matches */}
                <KnowledgeArticleCard
                  retrieval={pipelineData?.stages?.stage_3_retrieval}
                  explanation={pipelineData?.stages?.stage_4_explanation}
                  selectedArticleId={selectedArticleId}
                  onSelectArticle={handleSelectArticle}
                />

                {/* Draft Resolution & Analyst Action Workbench */}
                <ResolutionEditor
                  draftData={pipelineData?.stages?.stage_5_draft}
                  ticketId={selectedTicketId}
                  isReliable={pipelineData?.summary?.is_reliable_match}
                  onResolveTicket={handleResolveTicket}
                  onSubmitFeedback={handleSubmitFeedback}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: INTERACTIVE PIPELINE LAB */}
        {activeTab === 'lab' && (
          <InteractiveLab
            onProcessCustomTicket={handleProcessCustomTicket}
            applications={applicationsList}
          />
        )}

        {/* VIEW 3: KNOWLEDGE BASE EXPLORER */}
        {activeTab === 'kb' && (
          <KnowledgeBaseExplorer
            articles={knowledgeBase}
            categories={categories}
          />
        )}

        {/* VIEW 4: ANALYTICS & AUDIT LOG */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            analytics={analytics}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        IT AMS Prototype • Retrieval-Based Classification & Resolution Assistant • 100% Synthetic Local Data
      </footer>
    </div>
  );
}
