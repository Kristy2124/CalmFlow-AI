import { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { InboxView } from './components/InboxView';
import { CaseDetailView } from './components/CaseDetailView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { MultiAgentView } from './components/MultiAgentView';
import { CloudArchitectureView } from './components/CloudArchitectureView';
import { CustomSimulatorModal } from './components/CustomSimulatorModal';
import { AIChatbox } from './components/AIChatbox';
import { INITIAL_CASES } from './data/initialCases';
import { CaseItem } from './types';

export default function App() {
  const [cases, setCases] = useState<CaseItem[]>(INITIAL_CASES);
  const [currentView, setCurrentView] = useState<'dashboard' | 'inbox' | 'at-risk' | 'escalated' | 'case-detail' | 'analytics' | 'settings' | 'multi-agent' | 'cloud-architecture'>('dashboard');
  const [inboxTabFilter, setInboxTabFilter] = useState<string>('all');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-001'); // Defaults to Sarah Tan
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isChatboxOpen, setIsChatboxOpen] = useState<boolean>(false);

  // Active selected case item
  const selectedCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || cases[0];
  }, [cases, selectedCaseId]);

  // Navigate to case detail
  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCurrentView('case-detail');
  };

  // Update a case (e.g. after response approved or escalated)
  const handleUpdateCase = (updated: CaseItem) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Add custom case from simulator
  const handleAddCustomCase = (newCase: CaseItem) => {
    setCases((prev) => [newCase, ...prev]);
    setSelectedCaseId(newCase.id);
    setCurrentView('case-detail');
  };

  // Reset to default demo data
  const handleResetDemoData = () => {
    setCases(INITIAL_CASES);
    setSelectedCaseId('case-001');
    setCurrentView('dashboard');
  };

  // Quick navigation helpers
  const handleNavigateToInbox = (filter: string = 'all') => {
    setInboxTabFilter(filter);
    setCurrentView('inbox');
  };

  // Apply draft generated from AI Chatbox into active case
  const handleApplyDraftToCase = (caseId: string, draftBody: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            suggestedResponse: {
              ...c.suggestedResponse,
              body: draftBody
            }
          };
        }
        return c;
      })
    );
    setSelectedCaseId(caseId);
    setCurrentView('case-detail');
  };

  // Filter cases if top search is active
  const displayedCases = useMemo(() => {
    if (!searchQuery.trim()) return cases;
    const q = searchQuery.toLowerCase();
    return cases.filter(
      (c) =>
        c.client.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.request.toLowerCase().includes(q) ||
        c.caseNumber.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
    );
  }, [cases, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased relative">
      {/* Persistent Left Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'at-risk') {
            setInboxTabFilter('at-risk');
            setCurrentView('inbox');
          } else if (view === 'escalated') {
            setInboxTabFilter('escalated');
            setCurrentView('inbox');
          } else {
            setCurrentView(view);
          }
        }}
        cases={cases}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onToggleChatbox={() => setIsChatboxOpen((prev) => !prev)}
        isChatboxOpen={isChatboxOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCaseId={selectedCaseId}
          onSelectCase={handleSelectCase}
          cases={cases}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onResetDemoData={handleResetDemoData}
          onToggleChatbox={() => setIsChatboxOpen((prev) => !prev)}
        />

        {/* View Router */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              cases={displayedCases}
              onSelectCase={handleSelectCase}
              onNavigateToInbox={handleNavigateToInbox}
            />
          )}

          {currentView === 'inbox' && (
            <InboxView
              cases={displayedCases}
              selectedCaseId={selectedCaseId}
              onSelectCase={handleSelectCase}
              initialFilter={inboxTabFilter}
            />
          )}

          {currentView === 'case-detail' && (
            <CaseDetailView
              caseItem={selectedCase}
              onBack={() => setCurrentView('dashboard')}
              onUpdateCase={handleUpdateCase}
              onSelectCase={handleSelectCase}
              onOpenChatbox={() => setIsChatboxOpen(true)}
              onNavigateToMultiAgent={(caseId) => {
                setSelectedCaseId(caseId);
                setCurrentView('multi-agent');
              }}
            />
          )}

          {currentView === 'multi-agent' && (
            <MultiAgentView
              cases={displayedCases}
              selectedCaseId={selectedCaseId}
              onSelectCase={(caseId) => setSelectedCaseId(caseId)}
            />
          )}

          {currentView === 'analytics' && <AnalyticsView />}

          {currentView === 'cloud-architecture' && (
            <CloudArchitectureView cases={displayedCases} />
          )}

          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global AI Chatbox Widget */}
      <AIChatbox
        isOpen={isChatboxOpen}
        onToggle={() => setIsChatboxOpen((prev) => !prev)}
        onClose={() => setIsChatboxOpen(false)}
        cases={cases}
        selectedCaseId={selectedCaseId}
        onSelectCase={(id) => setSelectedCaseId(id)}
        onApplyDraftToCase={handleApplyDraftToCase}
      />

      {/* Custom Simulator Modal */}
      <CustomSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onAddCustomCase={handleAddCustomCase}
      />
    </div>
  );
}
