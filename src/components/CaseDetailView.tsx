import { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Edit3, 
  Mail, 
  ArrowLeft, 
  UserCheck, 
  CornerDownRight, 
  FileText, 
  AlertOctagon,
  ChevronDown,
  Info,
  Building,
  Check,
  Bot,
  GitBranch,
  Brain,
  Lock
} from 'lucide-react';
import { CaseItem, AISuggestedResponse, MultiAgentDeliberation, MLFeatureContribution } from '../types';
import { calculateMLFeatures, generateMultiAgentDeliberation } from '../utils/mlEngine';
import { CaseChatDrawer } from './CaseChatDrawer';

interface CaseDetailViewProps {
  caseItem: CaseItem;
  onBack: () => void;
  onUpdateCase: (updated: CaseItem) => void;
  onSelectCase: (caseId: string) => void;
  onNavigateToMultiAgent?: (caseId: string) => void;
  onOpenChatbox?: () => void;
}

export function CaseDetailView({ caseItem, onBack, onUpdateCase, onSelectCase, onNavigateToMultiAgent, onOpenChatbox }: CaseDetailViewProps) {
  const [showResponseGenerator, setShowResponseGenerator] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedTone, setSelectedTone] = useState<'empathetic' | 'balanced' | 'expedited'>(caseItem.suggestedResponse.tone || 'empathetic');
  const [composerSubject, setComposerSubject] = useState<string>(caseItem.suggestedResponse.subject);
  const [composerBody, setComposerBody] = useState<string>(caseItem.suggestedResponse.body);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState<boolean>(false);
  const [escalatedToSupervisor, setEscalatedToSupervisor] = useState<boolean>(false);
  const [intelligenceTab, setIntelligenceTab] = useState<'recommendation' | 'multi-agent'>('recommendation');
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);

  const deliberation: MultiAgentDeliberation = caseItem.multiAgentDeliberation || generateMultiAgentDeliberation(caseItem);
  const mlFeatures: MLFeatureContribution[] = caseItem.mlFeatures || calculateMLFeatures(caseItem);

  // Sync state when caseItem changes
  const currentCaseId = caseItem.id;

  const isHighEscalation = caseItem.riskPercentage >= 80;
  const isMediumRisk = caseItem.riskPercentage >= 50 && caseItem.riskPercentage < 80;
  const isSensitive = caseItem.status === 'Human Verification' || caseItem.riskLevel === 'Sensitive Security';
  const isNormal = caseItem.riskPercentage < 35 && !isSensitive;

  // Handle Regenerating Response via full-stack API
  const handleRegenerate = async (tone: 'empathetic' | 'balanced' | 'expedited') => {
    setSelectedTone(tone);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: caseItem.client,
          requestType: caseItem.request,
          emailBody: caseItem.email.body,
          waitingDays: caseItem.waitingDays,
          tone: tone,
          whyAtRisk: caseItem.whyAtRisk
        })
      });

      const data = await res.json();
      if (data.success && data.response) {
        setComposerBody(data.response);
      }
    } catch (err) {
      console.error('Failed to regenerate via server, using local fallback:', err);
      if (tone === 'expedited') {
        setComposerBody(`Hi ${caseItem.client},\n\nWe have escalated your case (${caseItem.request}) for immediate manual expediting with our operations supervisor. Our team is actively processing it and will deliver verified clearance by 2 PM today.\n\nNo further action is required from you at this time.\n\nBest regards,\nPriority Operations Unit\nAveris Shared Services`);
      } else if (tone === 'empathetic') {
        setComposerBody(`Hi ${caseItem.client},\n\nWe sincerely apologize for the delay with your request. It is currently undergoing an additional verification step with our senior audit team.\n\nOur team is actively expediting this and expects to provide the finalized update by Thursday at 3 PM.\n\nNo further action is required from you at this time.\n\nBest regards,\nFinance Operations Team\nAveris Shared Services`);
      } else {
        setComposerBody(`Hi ${caseItem.client},\n\nThank you for checking in on the status of ${caseItem.request}. We are in the final review stages and anticipate completion within 24 hours.\n\nThank you for your patience.\n\nBest regards,\nOperations Team\nAveris Shared Services`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Approve & Send
  const handleApproveAndSend = () => {
    const updatedTimeline = [
      ...caseItem.timeline,
      {
        date: 'Sept 17, 2026 — Just now',
        event: 'Proactive personalized response sent by Operations',
        type: 'agent' as const,
        detail: `Operator dispatched approved response: "${composerSubject}". Generic auto-reply avoided.`
      }
    ];

    const updatedCase: CaseItem = {
      ...caseItem,
      status: 'Resolved',
      unread: false,
      riskPercentage: Math.max(12, Math.round(caseItem.riskPercentage * 0.25)), // Drastically reduces risk
      timeline: updatedTimeline,
      notes: [...(caseItem.notes || []), `Proactive response sent on Sept 17: ${composerSubject}`]
    };

    onUpdateCase(updatedCase);
    setShowSuccessBanner(true);
    setTimeout(() => {
      setShowSuccessBanner(false);
    }, 6000);
  };

  // Handle Escalate Case to Senior Manager
  const handleEscalateCase = () => {
    setEscalatedToSupervisor(true);
    const updatedTimeline = [
      ...caseItem.timeline,
      {
        date: 'Sept 17, 2026 — Just now',
        event: 'Manually escalated to Senior Operations Supervisor',
        type: 'agent' as const,
        detail: 'Case flagged for executive briefing and priority queue bypass.'
      }
    ];

    const updatedCase: CaseItem = {
      ...caseItem,
      status: 'Escalation',
      agentAssigned: 'Operations Supervisor (Priority Queue)',
      timeline: updatedTimeline
    };

    onUpdateCase(updatedCase);
  };

  return (
    <div id="case-detail-screen" className="max-w-7xl mx-auto space-y-5">
      {/* Top Breadcrumb & Status Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-inbox"
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            title="Return to inbox"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {caseItem.client} — {caseItem.request}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {caseItem.caseNumber}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {caseItem.company}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-700">{caseItem.tier}</span>
              <span>•</span>
              <span>Assigned: {caseItem.agentAssigned || 'Operations Queue'}</span>
            </div>
          </div>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Status Badge */}
          {isHighEscalation && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              HIGH ESCALATION RISK
            </div>
          )}
          {isMediumRisk && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              AT RISK — ACTION REQUIRED
            </div>
          )}
          {isSensitive && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 font-bold text-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
              SENSITIVE SECURITY SAFEGUARD
            </div>
          )}
          {isNormal && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              NORMAL PROCESSING (LOW RISK)
            </div>
          )}
          {caseItem.status === 'Resolved' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              RESOLVED / ESCALATION AVERTED
            </div>
          )}

          <button
            id="btn-open-case-chat"
            onClick={() => {
              if (onOpenChatbox) {
                onOpenChatbox();
              } else {
                setIsChatDrawerOpen(true);
              }
            }}
            className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Chat with Case Copilot</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert if Sent */}
      {showSuccessBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold">Personalized response approved & dispatched to {caseItem.client}!</p>
              <p className="text-emerald-700 mt-0.5">
                CalmFlow AI has updated the timeline and logged the proactive commitment. Escalation risk reduced.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowSuccessBanner(false)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Two-Column Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column — Client Communication (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Client Email Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/75 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Client Communication
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">
                  {caseItem.email.threadCount} messages in thread
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="text-[11px] text-slate-500">
                  {caseItem.email.date}
                </span>
              </div>
            </div>

            <div className="p-5">
              {/* Sender Details Header */}
              <div className="border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {caseItem.email.subject}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      <span className="font-medium text-slate-500">From:</span> {caseItem.email.from}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      <span className="font-medium text-slate-500">To:</span> {caseItem.email.to}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Inbound Email
                    </span>
                  </div>
                </div>
              </div>

              {/* Realistic Email Body Text */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 font-sans text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                {caseItem.email.body}
              </div>
            </div>
          </div>

          {/* Communication Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Communication Timeline
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Tracking history & intervals
              </span>
            </div>

            {/* Timeline Tree */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {caseItem.timeline.map((event, idx) => {
                const isAI = event.type === 'ai';
                const isClient = event.type === 'client';
                const isAgent = event.type === 'agent';

                return (
                  <div key={idx} className="relative group">
                    {/* Dot on the timeline */}
                    <span className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                      isAI
                        ? 'bg-blue-600 ring-2 ring-blue-100'
                        : isAgent
                        ? 'bg-emerald-600 ring-2 ring-emerald-100'
                        : isClient
                        ? 'bg-slate-700'
                        : 'bg-slate-400'
                    }`}>
                      {isAI && <Sparkles className="w-2.5 h-2.5 text-white" />}
                      {isAgent && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>

                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <p className={`text-xs font-semibold ${isAI ? 'text-blue-900 font-bold' : 'text-slate-800'}`}>
                        {event.event}
                      </p>
                      <span className="text-[11px] text-slate-400 font-medium flex-shrink-0">
                        {event.date}
                      </span>
                    </div>

                    {event.detail && (
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                        {event.detail}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column — AI Intelligence (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main AI Analysis Centerpiece */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  CalmFlow AI Intelligence
                </h2>
              </div>
              <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Live Assessment
              </span>
            </div>

            {/* Sub-tab Navigation */}
            <div className="mt-3 flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
              <button
                type="button"
                onClick={() => setIntelligenceTab('recommendation')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  intelligenceTab === 'recommendation'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Executive Assessment
              </button>
              <button
                type="button"
                onClick={() => setIntelligenceTab('multi-agent')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  intelligenceTab === 'multi-agent'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                Multi-Agent & ML (XAI)
              </button>
            </div>

            {intelligenceTab === 'multi-agent' ? (
              /* Multi-Agent & ML View inside Case Detail */
              <div className="mt-4 space-y-4 animate-in fade-in duration-150">
                {/* Consensus Header */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Consensus Risk</span>
                    <span className="text-xl font-extrabold text-slate-900">{deliberation.consensusScore}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-500 block">Bot Suppression</span>
                    {deliberation.consensusScore >= 70 || deliberation.consensusDecision.includes('SECURITY') ? (
                      <span className="text-xs font-bold text-rose-700 flex items-center gap-1 justify-end">
                        <Lock className="w-3 h-3" /> Suppressed
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3 h-3" /> Permitted
                      </span>
                    )}
                  </div>
                </div>

                {/* 4 Agents Breakdown */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Specialist Agents ({deliberation.agents.length})
                  </span>
                  {deliberation.agents.map((ag) => (
                    <div key={ag.agentId} className="p-3 rounded-xl border border-slate-200/80 bg-white">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{ag.agentName}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          ag.vote === 'ESCALATE' ? 'bg-rose-100 text-rose-800' :
                          ag.vote === 'SECURITY_BLOCK' ? 'bg-purple-100 text-purple-800' :
                          ag.vote === 'SUPPRESS_BOT' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {ag.vote} ({ag.riskScore}%)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-1.5">{ag.roleTitle}</p>
                      <p className="text-[11px] text-slate-700 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed">
                        {ag.thoughtTrace}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ML SHAP Attribution Mini List */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    ML Feature Importance (SHAP Weights)
                  </span>
                  {mlFeatures.slice(0, 3).map((feat) => (
                    <div key={feat.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{feat.featureName}</span>
                        <span className={feat.direction === 'escalation_driver' ? 'text-rose-600 font-mono' : 'text-emerald-600 font-mono'}>
                          {feat.shapWeight > 0 ? `+${feat.shapWeight}` : feat.shapWeight} SHAP
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{feat.explanation}</p>
                    </div>
                  ))}
                </div>

                {onNavigateToMultiAgent && (
                  <button
                    onClick={() => onNavigateToMultiAgent(caseItem.id)}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    Open Interactive Multi-Agent Lab
                  </button>
                )}
              </div>
            ) : (
              /* Standard Executive Assessment */
              <div>

            {/* Visual Centerpiece: Escalation Risk Progress & Percentage */}
            <div className="my-5 p-4 rounded-xl bg-slate-50/80 border border-slate-200/70">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Escalation Risk
                </span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-extrabold ${
                    isHighEscalation ? 'text-rose-600' : isMediumRisk ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {caseItem.riskPercentage}%
                  </span>
                  <span className="text-xs text-slate-400 font-medium">probability</span>
                </div>
              </div>

              {/* Horizontal Progress / Risk Indicator */}
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    isHighEscalation 
                      ? 'bg-rose-500' 
                      : isMediumRisk 
                      ? 'bg-amber-500' 
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${caseItem.riskPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
                <span>0% Safe</span>
                <span>50% Threshold</span>
                <span>100% Critical</span>
              </div>
            </div>

            {/* Key Indicators Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* Sentiment */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[11px] text-slate-500 block font-medium">Sentiment</span>
                <span className={`text-xs font-bold mt-1 inline-block ${
                  caseItem.sentiment === 'Very Negative' 
                    ? 'text-rose-700' 
                    : caseItem.sentiment === 'Negative' 
                    ? 'text-amber-700' 
                    : caseItem.sentiment === 'Positive'
                    ? 'text-emerald-700'
                    : 'text-slate-700'
                }`}>
                  {caseItem.sentiment}
                </span>
              </div>

              {/* Intent */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[11px] text-slate-500 block font-medium">Intent</span>
                <span className="text-xs font-bold text-slate-800 mt-1 inline-block truncate max-w-[140px]" title={caseItem.intent}>
                  {caseItem.intent}
                </span>
              </div>

              {/* Urgency */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[11px] text-slate-500 block font-medium">Urgency</span>
                <span className={`text-xs font-bold mt-1 inline-block ${
                  caseItem.urgency === 'High' ? 'text-rose-700' : caseItem.urgency === 'Medium' ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {caseItem.urgency}
                </span>
              </div>

              {/* Waiting Time */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[11px] text-slate-500 block font-medium">Waiting Time</span>
                <span className="text-xs font-bold text-slate-800 mt-1 inline-block">
                  {caseItem.waitingDays === 0 ? '< 1 day' : `${caseItem.waitingDays} days`}
                </span>
              </div>
            </div>

            {/* Why is this case at risk? Explanation Section */}
            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 mb-2">
                Why is this case at risk?
              </h3>
              <div className="space-y-1.5">
                {caseItem.whyAtRisk.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
                    <span className="text-emerald-600 font-bold flex-shrink-0 mt-0.5">✓</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

          {/* Section 4: AI Recommendation Card */}
          <div className={`p-5 rounded-2xl border shadow-xs transition-all ${
            isHighEscalation 
              ? 'bg-rose-50/40 border-rose-200' 
              : isSensitive 
              ? 'bg-purple-50/40 border-purple-200' 
              : isMediumRisk 
              ? 'bg-amber-50/40 border-amber-200' 
              : 'bg-emerald-50/40 border-emerald-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className={`w-4 h-4 ${
                isHighEscalation ? 'text-rose-600' : isSensitive ? 'text-purple-600' : isMediumRisk ? 'text-amber-600' : 'text-emerald-600'
              }`} />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                AI Recommendation
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900">
              {caseItem.recommendation.title}
            </h4>

            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {caseItem.recommendation.explanation}
            </p>

            {caseItem.recommendation.riskWarning && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-white/80 border border-slate-200/80 text-[11px] text-rose-800 font-medium">
                {caseItem.recommendation.riskWarning}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
              {!isSensitive ? (
                <button
                  id="btn-generate-response"
                  onClick={() => setShowResponseGenerator(true)}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Response
                </button>
              ) : (
                <button
                  id="btn-security-verify"
                  onClick={() => alert('Security Verification Protocol Activated: Callback dispatch scheduled with authorized corporate treasurer.')}
                  className="flex-1 py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Initiate Voice Verification
                </button>
              )}

              <button
                id="btn-escalate-case"
                onClick={handleEscalateCase}
                disabled={escalatedToSupervisor}
                className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {escalatedToSupervisor ? 'Escalated' : 'Escalate Case'}
              </button>
            </div>
          </div>

          {/* Section 5: AI Response Generator (Composer) */}
          {showResponseGenerator && !isSensitive && (
            <div id="ai-response-generator" className="bg-white rounded-2xl border border-blue-200 shadow-xs p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    AI Suggested Response
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleRegenerate('empathetic')}
                    className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${
                      selectedTone === 'empathetic' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Empathetic
                  </button>
                  <button
                    onClick={() => handleRegenerate('expedited')}
                    className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${
                      selectedTone === 'expedited' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Expedited
                  </button>
                </div>
              </div>

              {/* Human Review Banner Required */}
              <div className="my-3 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Human Review Required:</strong> CalmFlow AI generates draft communications for operator review. Edits and approval must be confirmed before sending.
                </span>
              </div>

              {/* Subject Line */}
              <div className="mb-2.5">
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={composerSubject}
                  onChange={(e) => setComposerSubject(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Editable Response Body */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-500">
                    Email Content
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {isGenerating ? 'AI composing with Gemini...' : 'Editable text area'}
                  </span>
                </div>
                <textarea
                  id="composer-textarea"
                  rows={8}
                  value={composerBody}
                  onChange={(e) => setComposerBody(e.target.value)}
                  disabled={isGenerating}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed font-sans"
                />
              </div>

              {/* Buttons: Edit, Regenerate, Approve & Send */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  id="btn-regenerate-response"
                  onClick={() => handleRegenerate(selectedTone)}
                  disabled={isGenerating}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                  Regenerate
                </button>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-edit-response"
                    onClick={() => {
                      const el = document.getElementById('composer-textarea');
                      el?.focus();
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    Edit
                  </button>

                  <button
                    id="btn-approve-send"
                    onClick={handleApproveAndSend}
                    disabled={isGenerating}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs shadow-emerald-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Approve & Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive AI Case Copilot Chat Drawer */}
      <CaseChatDrawer
        caseItem={caseItem}
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        onApplyDraftToComposer={(draftText) => {
          setShowResponseGenerator(true);
          setComposerBody(draftText);
          setIsEditing(true);
        }}
      />
    </div>
  );
}
