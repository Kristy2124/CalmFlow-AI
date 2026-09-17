import { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Plus
} from 'lucide-react';
import { CaseItem } from '../types';
import { generateMultiAgentDeliberation, calculateMLFeatures } from '../utils/mlEngine';

interface CustomSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomCase: (newCase: CaseItem) => void;
}

export function CustomSimulatorModal({ isOpen, onClose, onAddCustomCase }: CustomSimulatorModalProps) {
  const [clientName, setClientName] = useState('Alex Mercer');
  const [company, setCompany] = useState('Metro Logistics Partner');
  const [waitingDays, setWaitingDays] = useState(4);
  const [emailText, setEmailText] = useState(
    "Hi, we have sent three emails over the past 4 days regarding PO-9912. If this is not settled by today, our managing director will escalate to Averis executive management. We cannot accept any further automated delay notices."
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  if (!isOpen) return null;

  // Preset scenarios for instant testing by hackathon judges
  const loadPreset = (preset: 'frustrated' | 'routine' | 'sensitive') => {
    if (preset === 'frustrated') {
      setClientName('Sarah Tan');
      setCompany('Apex Global Logistics');
      setWaitingDays(5);
      setEmailText(
        "Hi, I submitted this request five days ago and still haven't received an update. This is becoming extremely frustrating because we need the payment processed urgently."
      );
    } else if (preset === 'routine') {
      setClientName('Emily Wong');
      setCompany('Pacific Coast Logistics');
      setWaitingDays(1);
      setEmailText(
        "Hi, could you please let me know the status of invoice PO-45821? Just following up as part of our routine weekly reconciliation. Thank you!"
      );
    } else if (preset === 'sensitive') {
      setClientName('Robert Chen');
      setCompany('Global Fleet Services');
      setWaitingDays(0);
      setEmailText(
        "Please change the bank account associated with our payment immediately to our new IBAN account DE89370400440532013000."
      );
    }
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailText,
          clientName,
          waitingDays
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAnalysisResult(data.data);
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImportToCases = () => {
    if (!analysisResult) return;

    const newCase: CaseItem = {
      id: `case-custom-${Date.now()}`,
      caseNumber: `CF-${Math.floor(1000 + Math.random() * 9000)}`,
      client: clientName,
      clientEmail: `${clientName.toLowerCase().replace(' ', '.')}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      company: company,
      tier: 'Strategic Enterprise',
      request: analysisResult.intent || 'Client Enquiry',
      subject: `Enquiry: ${analysisResult.intent || 'Operational Request'}`,
      preview: emailText.slice(0, 100) + '...',
      waitingDays: waitingDays,
      waitingHours: waitingDays * 24,
      sentiment: analysisResult.sentiment,
      intent: analysisResult.intent,
      urgency: analysisResult.urgency,
      riskPercentage: analysisResult.riskPercentage,
      riskLevel: analysisResult.riskLevel,
      status: analysisResult.status,
      unread: true,
      whyAtRisk: analysisResult.whyAtRisk || ['Evaluated by CalmFlow live analysis engine'],
      recommendation: analysisResult.recommendation,
      email: {
        id: `email-custom-${Date.now()}`,
        from: `${clientName} <${clientName.toLowerCase().replace(' ', '.')}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com>`,
        senderName: clientName,
        to: 'Averis Shared Services <operations@averis.com>',
        date: 'Just now',
        subject: `Enquiry: ${analysisResult.intent || 'Operational Request'}`,
        body: emailText,
        threadCount: 2
      },
      timeline: [
        {
          date: 'Sept 17, 2026',
          event: 'Client email received',
          type: 'client',
          detail: 'Analyzed via CalmFlow AI interactive evaluator.'
        },
        {
          date: 'Sept 17, 2026',
          event: `CalmFlow AI assessed ${analysisResult.riskPercentage}% risk`,
          type: 'ai',
          detail: `Recommendation: ${analysisResult.recommendation.title}`
        }
      ],
      suggestedResponse: analysisResult.suggestedResponse || {
        subject: `Update regarding your request`,
        body: `Hi ${clientName},\n\nWe received your request and are processing it with priority.\n\nBest regards,\nAveris Operations`,
        tone: 'empathetic',
        confidence: 92,
        requiresReview: true
      },
      agentAssigned: 'Operations Queue',
      lastUpdated: 'Just now'
    };

    newCase.multiAgentDeliberation = generateMultiAgentDeliberation(newCase);
    newCase.mlFeatures = calculateMLFeatures(newCase);

    onAddCustomCase(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="custom-simulator-modal"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                CalmFlow AI — Live Hackathon Email Evaluator
              </h2>
              <p className="text-xs text-slate-500">
                Test how CalmFlow AI predicts frustration and prevents escalation on any custom email
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Quick Presets Bar */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Quick Test Presets (for Hackathon Judges)
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadPreset('frustrated')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                🔴 Sarah Tan (High Escalation 91%)
              </button>
              <button
                type="button"
                onClick={() => loadPreset('routine')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                🟢 Emily Wong (Normal Restraint 21%)
              </button>
              <button
                type="button"
                onClick={() => loadPreset('sensitive')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
              >
                🛡️ Robert Chen (Sensitive Bank Change)
              </button>
            </div>
          </div>

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Company / Vendor
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                <span>Waiting Time</span>
                <span className="font-bold text-blue-600">{waitingDays} days</span>
              </label>
              <input
                type="range"
                min="0"
                max="8"
                value={waitingDays}
                onChange={(e) => setWaitingDays(parseInt(e.target.value))}
                className="w-full mt-1 cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Email Text Area */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Incoming Client Email Text
            </label>
            <textarea
              rows={4}
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="Paste or type any incoming client email..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed font-sans"
            />
          </div>

          {/* Analyze Trigger Button */}
          <div>
            <button
              id="btn-run-analysis"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !emailText.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-200 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'CalmFlow AI analyzing email context...' : 'Run CalmFlow AI Escalation Analysis'}
            </button>
          </div>

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  AI Evaluation Output
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    analysisResult.riskPercentage >= 70 
                      ? 'bg-rose-100 text-rose-800' 
                      : analysisResult.riskPercentage >= 40 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {analysisResult.riskPercentage}% Escalation Risk
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600">
                    Status: {analysisResult.status}
                  </span>
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Sentiment</span>
                  <span className="font-bold text-slate-800">{analysisResult.sentiment}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Intent</span>
                  <span className="font-bold text-slate-800 truncate block">{analysisResult.intent}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Urgency</span>
                  <span className="font-bold text-slate-800">{analysisResult.urgency}</span>
                </div>
              </div>

              {/* Recommendation */}
              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs">
                <p className="font-bold text-blue-900">{analysisResult.recommendation.title}</p>
                <p className="text-blue-800/90 text-[11px] mt-0.5">{analysisResult.recommendation.explanation}</p>
              </div>

              {/* Risk Factors Checklist */}
              {analysisResult.whyAtRisk && (
                <div>
                  <p className="text-[11px] font-bold text-slate-700 mb-1">Detected Risk Signals:</p>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {analysisResult.whyAtRisk.map((r: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Import button */}
              <div className="pt-2">
                <button
                  id="btn-import-custom-case"
                  onClick={handleImportToCases}
                  className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Import this Case into Active Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
