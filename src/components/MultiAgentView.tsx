import { useState, useMemo } from 'react';
import { 
  Bot, 
  Brain, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Play, 
  RefreshCw, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  GitBranch, 
  Activity, 
  FileText,
  HelpCircle,
  BarChart2,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Layers,
  Lock
} from 'lucide-react';
import { CaseItem, MultiAgentDeliberation, AgentOpinion, MLFeatureContribution } from '../types';
import { DEFAULT_MODEL_METRICS, simulateMLPrediction, calculateMLFeatures } from '../utils/mlEngine';

interface MultiAgentViewProps {
  cases: CaseItem[];
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
}

export function MultiAgentView({ cases, selectedCaseId, onSelectCase }: MultiAgentViewProps) {
  const [activeTab, setActiveTab] = useState<'deliberation' | 'ml-xai'>('deliberation');
  const [isDeliberating, setIsDeliberating] = useState(false);
  const [expandedThought, setExpandedThought] = useState<string | null>('agent-sentix');
  
  // ML Calibration interactive state
  const [slaSensitivity, setSlaSensitivity] = useState<number>(1.2);
  const [sentimentSensitivity, setSentimentSensitivity] = useState<number>(1.3);
  const [tierMultiplier, setTierMultiplier] = useState<number>(1.1);
  const [suppressionThreshold, setSuppressionThreshold] = useState<number>(70);

  const currentCase = useMemo(() => {
    return cases.find(c => c.id === selectedCaseId) || cases[0];
  }, [cases, selectedCaseId]);

  const deliberation: MultiAgentDeliberation = useMemo(() => {
    if (currentCase.multiAgentDeliberation) {
      return currentCase.multiAgentDeliberation;
    }
    // Fallback if not populated
    return {
      consensusScore: currentCase.riskPercentage,
      consensusDecision: currentCase.riskPercentage > 70 ? 'SUPPRESS_AUTO_REPLY_AND_ESCALATE' : 'NORMAL_PROCESSING_PERMITTED',
      conflictDetected: false,
      conflictResolutionNotes: 'All agents align on evaluation.',
      deliberationTimestamp: 'Live Evaluated',
      agents: [],
      coordinatorSummary: currentCase.recommendation.title
    };
  }, [currentCase]);

  const mlFeatures: MLFeatureContribution[] = useMemo(() => {
    return currentCase.mlFeatures || calculateMLFeatures(currentCase);
  }, [currentCase]);

  // Real-time simulated prediction based on calibration sliders
  const calibratedPrediction = useMemo(() => {
    return simulateMLPrediction(currentCase.riskPercentage, {
      slaWeightMultiplier: slaSensitivity,
      sentimentSensitivity: sentimentSensitivity,
      tierMultiplier: tierMultiplier,
      suppressionThreshold: suppressionThreshold
    });
  }, [currentCase.riskPercentage, slaSensitivity, sentimentSensitivity, tierMultiplier, suppressionThreshold]);

  // Live trigger deliberation API
  const handleTriggerLiveDeliberation = async () => {
    setIsDeliberating(true);
    try {
      const res = await fetch('/api/multi-agent-deliberate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: currentCase.client,
          emailText: currentCase.email.body,
          waitingDays: currentCase.waitingDays,
          requestType: currentCase.request,
          tier: currentCase.tier,
          company: currentCase.company
        })
      });
      const data = await res.json();
      if (data.success && data.deliberation) {
        currentCase.multiAgentDeliberation = data.deliberation;
      }
    } catch (e) {
      console.error('Deliberation call error:', e);
    } finally {
      setTimeout(() => {
        setIsDeliberating(false);
      }, 500);
    }
  };

  const getAgentIcon = (id: string) => {
    if (id === 'agent-sentix') return Brain;
    if (id === 'agent-chronos') return Clock;
    if (id === 'agent-aegis') return ShieldAlert;
    return Sparkles;
  };

  const getVoteBadge = (vote: string) => {
    if (vote === 'ESCALATE') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">VOTE: ESCALATE</span>;
    }
    if (vote === 'SUPPRESS_BOT') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">VOTE: SUPPRESS BOT</span>;
    }
    if (vote === 'SECURITY_BLOCK') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">VOTE: SECURITY BLOCK</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">VOTE: NORMAL BOT</span>;
  };

  return (
    <div id="multi-agent-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-2">
            <Bot className="w-3.5 h-3.5 text-blue-600" />
            Autonomous Multi-Agent Consensus & Machine Learning Explainability (XAI)
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Specialist Agent Deliberation Network
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            CalmFlow deploys four specialized autonomous agents (Psycholinguistic, Operational SLA, Security Sentinel, and Consensus Coordinator) to deliberate on every communication before acting.
          </p>
        </div>

        {/* Case Selector Dropdown & Live Trigger */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">Evaluating:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => onSelectCase(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.client} ({c.riskPercentage}% — {c.status})
                </option>
              ))}
            </select>
          </div>

          <button
            id="btn-trigger-deliberation"
            onClick={handleTriggerLiveDeliberation}
            disabled={isDeliberating}
            className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDeliberating ? 'animate-spin' : ''}`} />
            {isDeliberating ? 'Agents Deliberating...' : 'Run Agent Deliberation'}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('deliberation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'deliberation'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          Multi-Agent Deliberation & Consensus ({deliberation.agents.length} Agents)
        </button>

        <button
          onClick={() => setActiveTab('ml-xai')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ml-xai'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Machine Learning Feature Attribution & Model Calibration (XAI)
        </button>
      </div>

      {/* TAB 1: Multi-Agent Consensus & Deliberation */}
      {activeTab === 'deliberation' && (
        <div className="space-y-6">
          {/* Visual Architecture Topology Diagram */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Agent Pipeline Topology & Message Flow
                </h3>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                Consensus Algorithm: Multi-Criteria Bayesian Weighted Arbitration
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Agent 1: Sentix */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Brain className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Agent 1
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Sentix</h4>
                <p className="text-[11px] text-slate-500 font-medium">Psycholinguistic Specialist</p>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                  Analyzes lexical frustration slope, emotional decay, urgency cues.
                </p>
              </div>

              {/* Agent 2: Chronos */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Agent 2
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Chronos</h4>
                <p className="text-[11px] text-slate-500 font-medium">SLA & Operations Context</p>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                  Evaluates contract SLAs (72h standard), turnaround drift, queue backpressure.
                </p>
              </div>

              {/* Agent 3: Aegis */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    Agent 3
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Aegis</h4>
                <p className="text-[11px] text-slate-500 font-medium">Security & Compliance Sentinel</p>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                  Intercepts bank credential alterations, BEC phishing, and fraudulent redirects.
                </p>
              </div>

              {/* Agent 4: Synthetix */}
              <div className="p-3.5 rounded-xl border-2 border-blue-300 bg-blue-50/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    Coordinator
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Synthetix</h4>
                <p className="text-[11px] text-blue-700 font-semibold">Consensus Arbitrator</p>
                <p className="text-[10px] text-blue-800/80 mt-1 leading-tight">
                  Synthesizes agent votes, suppresses blind bots, and prescribes human action.
                </p>
              </div>
            </div>
          </div>

          {/* Consensus Arbitration Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                  deliberation.consensusScore >= 70 ? 'bg-rose-600' : deliberation.consensusScore >= 40 ? 'bg-amber-500' : 'bg-emerald-600'
                }`}>
                  {deliberation.consensusScore}%
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Arbitrated Consensus: {deliberation.consensusDecision.replace(/_/g, ' ')}
                    </h3>
                    {deliberation.conflictDetected && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Agent Conflict Arbitrated
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {deliberation.coordinatorSummary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-600">Auto-Reply Policy:</span>
                {deliberation.consensusScore >= 70 || deliberation.consensusDecision.includes('SECURITY') ? (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    SUPPRESSED (Prevents Client Anger)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    PERMITTED (Intelligent Restraint)
                  </span>
                )}
              </div>
            </div>

            {deliberation.conflictResolutionNotes && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-900">Coordinator Resolution Notes: </span>
                {deliberation.conflictResolutionNotes}
              </div>
            )}
          </div>

          {/* Individual Agent Deliberation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliberation.agents.map((agent) => {
              const Icon = getAgentIcon(agent.agentId);
              const isExpanded = expandedThought === agent.agentId;

              return (
                <div 
                  key={agent.agentId}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Agent Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{agent.agentName}</h4>
                          <span className="text-[11px] text-slate-500 font-medium">{agent.roleTitle}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {getVoteBadge(agent.vote)}
                        <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                          {agent.confidence}% confidence
                        </span>
                      </div>
                    </div>

                    {/* Risk Progress Bar */}
                    <div className="my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-600">Assessed Risk Score</span>
                        <span className={`font-bold font-mono ${
                          agent.riskScore >= 70 ? 'text-rose-600' : agent.riskScore >= 40 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {agent.riskScore}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            agent.riskScore >= 70 ? 'bg-rose-500' : agent.riskScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${agent.riskScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Key Findings Checklist */}
                    <div className="space-y-1 mb-3">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1">Observed Signals:</span>
                      {agent.keyFindings.map((finding, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600 leading-snug">
                          <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                          <span>{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expandable Internal Thought Trace */}
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setExpandedThought(isExpanded ? null : agent.agentId)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5 text-slate-400" />
                        Agent Internal Deliberation Log
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-50 text-[11px] font-mono text-slate-700 leading-relaxed border border-slate-200 animate-in fade-in duration-150">
                        {agent.thoughtTrace}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Machine Learning Feature Attribution & Model Calibration */}
      {activeTab === 'ml-xai' && (
        <div className="space-y-6">
          {/* Model Overview & Validation Benchmark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Model Architecture</span>
              <div className="mt-2 text-sm font-bold text-slate-900 leading-tight">
                Gradient Boosted Trees (LightGBM) + DeBERTa-v3
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Calibrated for Averis Ops</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">ROC-AUC Discrimination</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">{DEFAULT_MODEL_METRICS.rocAuc}</span>
                <span className="text-xs font-semibold text-emerald-700">Top 1% Tier</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Separation of true frustration</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Precision / Recall</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">{DEFAULT_MODEL_METRICS.precision}%</span>
                <span className="text-xs font-semibold text-slate-600">/ {DEFAULT_MODEL_METRICS.recall}%</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">F1-Score: {DEFAULT_MODEL_METRICS.f1Score}%</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">False Escalation Suppression</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-emerald-700">{DEFAULT_MODEL_METRICS.falseEscalationSuppression}%</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Protects operators from alert fatigue</span>
            </div>
          </div>

          {/* SHAP Feature Attribution Table & Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  SHAP Feature Attribution (Explainable AI)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mathematical feature weight contributions explaining why {currentCase.client} scored {currentCase.riskPercentage}% risk
                </p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                Case: {currentCase.caseNumber}
              </span>
            </div>

            <div className="p-5 space-y-4">
              {mlFeatures.map((feat) => {
                const isDriver = feat.direction === 'escalation_driver';
                return (
                  <div key={feat.id} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{feat.featureName}</span>
                        <span className="text-xs text-slate-500 font-mono ml-2">Value: {feat.rawVal}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                          isDriver ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {feat.shapWeight > 0 ? `+${feat.shapWeight}` : feat.shapWeight} SHAP ({feat.percentageWeight}%)
                        </span>
                        <span className="text-[10px] font-semibold uppercase text-slate-400">
                          {isDriver ? 'Escalation Driver' : 'Calming Factor'}
                        </span>
                      </div>
                    </div>

                    {/* Attribution bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                      <div 
                        className={`h-full rounded-full ${isDriver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, feat.percentageWeight * 1.5)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-600 leading-normal">
                      {feat.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Model Calibration Workbench */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Live Machine Learning Calibration Lab
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Interactive parameter simulation for Averis Operations
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Adjust the feature weight multipliers below to test how the ML ensemble responds to SLA delays, linguistic sensitivity, and contract tier priorities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Slider 1: SLA Sensitivity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">SLA Delay Sensitivity</span>
                  <span className="font-mono font-bold text-blue-600">{slaSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={slaSensitivity}
                  onChange={(e) => setSlaSensitivity(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">
                  Controls how aggressively days elapsed beyond 72h penalize the score.
                </p>
              </div>

              {/* Slider 2: Sentiment Sensitivity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Linguistic Frustration Multiplier</span>
                  <span className="font-mono font-bold text-rose-600">{sentimentSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={sentimentSensitivity}
                  onChange={(e) => setSentimentSensitivity(parseFloat(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">
                  Weights urgency and negative lexical cues ("frustrated", "freeze deliveries").
                </p>
              </div>

              {/* Slider 3: Suppression Threshold */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Auto-Reply Suppression Threshold</span>
                  <span className="font-mono font-bold text-amber-600">{suppressionThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="1"
                  value={suppressionThreshold}
                  onChange={(e) => setSuppressionThreshold(parseInt(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">
                  Score above which automated bots are silenced to prevent triggering client complaints.
                </p>
              </div>
            </div>

            {/* Live Recalculated Output Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Recalculated Simulation Result</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-slate-900">
                    {calibratedPrediction.calibratedRisk}% Simulated Risk
                  </span>
                  <span className="text-xs text-slate-500">
                    (Base: {currentCase.riskPercentage}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Decision Boundary</span>
                  <span className="text-xs font-bold text-slate-800">
                    {calibratedPrediction.isSuppressed ? '🔴 Auto-Reply Suppressed' : '🟢 Normal Bot Allowed'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSlaSensitivity(1.0);
                    setSentimentSensitivity(1.0);
                    setTierMultiplier(1.0);
                    setSuppressionThreshold(70);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
