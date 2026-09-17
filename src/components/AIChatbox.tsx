import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  Brain, 
  Clock, 
  ShieldAlert, 
  RefreshCw, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  ChevronDown, 
  FileText, 
  CornerDownLeft, 
  AlertTriangle, 
  Layers, 
  UserCheck, 
  Zap,
  RotateCcw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { CaseItem, CaseChatMessage } from '../types';

interface AIChatboxProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  cases: CaseItem[];
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  onApplyDraftToCase?: (caseId: string, draftBody: string) => void;
}

export function AIChatbox({
  isOpen,
  onToggle,
  onClose,
  cases,
  selectedCaseId,
  onSelectCase,
  onApplyDraftToCase
}: AIChatboxProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<'copilot' | 'sentix' | 'chronos' | 'aegis'>('copilot');
  const [isGlobalMode, setIsGlobalMode] = useState(false);
  const [messages, setMessages] = useState<CaseChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  // Initialize conversation when opened or context changes
  useEffect(() => {
    if (messages.length === 0) {
      resetConversation();
    }
  }, [selectedCaseId, isGlobalMode]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const resetConversation = () => {
    if (isGlobalMode) {
      setMessages([
        {
          id: `welcome-global-${Date.now()}`,
          role: 'assistant',
          timestamp: 'Just now',
          persona: 'copilot',
          content: `Hello! I am **CalmFlow Global Operations Copilot**.\n\nI have real-time visibility across all **${cases.length} active cases** in the Averis queue (${cases.filter(c => c.riskPercentage >= 70).length} at critical escalation risk).\n\nAsk me anything:\n- Which cases require immediate intervention before SLA breach?\n- How does CalmFlow's intelligent bot suppression protect client relationships?\n- Inquire about Averis Treasury policies on unauthorized bank account changes.`
        }
      ]);
    } else {
      setMessages([
        {
          id: `welcome-${activeCase?.id || 'case'}-${Date.now()}`,
          role: 'assistant',
          timestamp: 'Just now',
          persona: selectedPersona,
          content: `Hello! I am **CalmFlow Copilot**, actively advising on **Case ${activeCase?.caseNumber}** (${activeCase?.client}, ${activeCase?.company}).\n\n- **Escalation Risk:** ${activeCase?.riskPercentage}% (${activeCase?.status})\n- **Waiting Duration:** ${activeCase?.waitingDays} days (SLA: 3 days)\n- **Primary Issue:** ${activeCase?.request}\n\nAsk me to diagnose root causes of client frustration, draft a guaranteed de-escalation response, or simulate client reactions!`
        }
      ]);
    }
  };

  const quickPrompts = isGlobalMode
    ? [
        { label: "Top critical cases today", prompt: "Which cases have the highest escalation risk and require immediate intervention today?" },
        { label: "Explain auto-reply suppression", prompt: "Why does CalmFlow suppress generic automated replies for at-risk clients?" },
        { label: "Treasury bank change policy", prompt: "What is the mandatory protocol for handling client requests to change bank account or payment details?" },
        { label: "Overall queue SLA health", prompt: "Summarize our overall queue SLA performance and turnaround bottlenecks." }
      ]
    : [
        { label: `Why is ${activeCase?.client.split(' ')[0]} frustrated?`, prompt: `What are the primary psychological and operational root causes of ${activeCase?.client}'s frustration?` },
        { label: "Draft de-escalation reply (3 PM)", prompt: `Draft a personalized, calming operational update for ${activeCase?.client} that commits to a specific 3:00 PM timeline today and de-escalates risk.` },
        { label: "Simulate reaction if delayed 24h", prompt: `Simulate how ${activeCase?.client} will react if we tell them we need another 24 hours to review their request.` },
        { label: "Check security & compliance risks", prompt: `Check this case (${activeCase?.request}) for any corporate fraud, unauthorized bank alteration, or compliance red flags.` }
      ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isLoading) return;

    const userMsg: CaseChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: 'Just now',
      persona: selectedPersona
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputVal('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/case-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseContext: isGlobalMode
            ? null
            : {
                caseNumber: activeCase.caseNumber,
                client: activeCase.client,
                clientEmail: activeCase.clientEmail,
                company: activeCase.company,
                tier: activeCase.tier,
                request: activeCase.request,
                waitingDays: activeCase.waitingDays,
                waitingHours: activeCase.waitingHours,
                riskPercentage: activeCase.riskPercentage,
                riskLevel: activeCase.riskLevel,
                sentiment: activeCase.sentiment,
                urgency: activeCase.urgency,
                emailBody: activeCase.email.body,
                whyAtRisk: activeCase.whyAtRisk,
                recommendationTitle: activeCase.recommendation.title,
                recommendationExplanation: activeCase.recommendation.explanation
              },
          globalContext: {
            totalCases: cases.length,
            atRiskCount: cases.filter(c => c.riskPercentage >= 70).length,
            casesSummary: cases.map(c => ({
              id: c.id,
              client: c.client,
              risk: c.riskPercentage,
              request: c.request,
              waitingDays: c.waitingDays
            }))
          },
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          agentPersona: selectedPersona
        })
      });

      const data = await res.json();
      if (data.reply) {
        const assistantMsg: CaseChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: 'Just now',
          persona: selectedPersona
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch {
      // Local fallback
      const fallbackMsg: CaseChatMessage = {
        id: `bot-fallback-${Date.now()}`,
        role: 'assistant',
        content: `I have analyzed your inquiry. For **${activeCase.client}**, proactive human communication committing to a firm resolution time (e.g. today by 3:00 PM) is the highest-confidence action to prevent escalation.`,
        timestamp: 'Just now',
        persona: selectedPersona
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyToComposer = (text: string, id: string) => {
    // Clean potential markdown quotes
    const cleaned = text.replace(/^"|"$/g, '').trim();
    if (onApplyDraftToCase) {
      onApplyDraftToCase(activeCase.id, cleaned);
    }
    setAppliedId(id);
    setTimeout(() => setAppliedId(null), 2500);
  };

  return (
    <>
      {/* Floating Toggle Button (Always visible on bottom right if chatbox is closed) */}
      {!isOpen && (
        <button
          id="btn-floating-ai-copilot"
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-blue-400/30 group"
          title="Open CalmFlow AI Operations Copilot"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white"></span>
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-extrabold tracking-wide flex items-center gap-1.5">
              <span>AI Chat Copilot</span>
              <span className="px-1.5 py-0.2 bg-white/20 rounded text-[9px] font-mono">Gemini</span>
            </div>
            <div className="text-[10px] text-blue-100 font-medium">
              {activeCase ? `Advising on ${activeCase.client.split(' ')[0]}` : 'Operations Assistant'}
            </div>
          </div>
        </button>
      )}

      {/* Floating Chatbox Window */}
      {isOpen && (
        <div
          id="calmflow-ai-chatbox-window"
          className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col transition-all duration-200 overflow-hidden ${
            isMaximized
              ? 'inset-4 sm:inset-10 max-w-4xl max-h-[860px] m-auto'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-full max-w-[92vw] sm:max-w-[420px] md:max-w-[450px] h-[580px] sm:h-[620px]'
          }`}
        >
          {/* Top Header Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-3.5 flex items-center justify-between border-b border-slate-700/60 select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-extrabold tracking-tight truncate">CalmFlow AI Chatbox</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 truncate">
                  {isGlobalMode ? (
                    <span className="text-blue-300 font-semibold">Global Operations Queue Context</span>
                  ) : (
                    <span>
                      Target: <strong className="text-white">{activeCase.client}</strong> ({activeCase.riskPercentage}% risk)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <button
                id="btn-chatbox-reset"
                onClick={resetConversation}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Restart conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                id="btn-chatbox-maximize"
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
                title={isMaximized ? "Minimize window" : "Maximize window"}
              >
                {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                id="btn-chatbox-close"
                onClick={onClose}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-red-500/30 rounded-lg transition-colors"
                title="Close chatbox"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Switcher & Active Case Indicator */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center justify-between gap-2 text-xs">
            {/* Mode Switcher (Active Case vs Global) */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-semibold">
              <button
                onClick={() => setIsGlobalMode(false)}
                className={`px-2 py-1 rounded-md transition-all ${
                  !isGlobalMode 
                    ? 'bg-white text-blue-700 shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active Case
              </button>
              <button
                onClick={() => setIsGlobalMode(true)}
                className={`px-2 py-1 rounded-md transition-all ${
                  isGlobalMode 
                    ? 'bg-white text-blue-700 shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Global Ops
              </button>
            </div>

            {/* Case Quick Dropdown if in Case Mode */}
            {!isGlobalMode ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-bold hidden sm:inline">Case:</span>
                <select
                  value={selectedCaseId}
                  onChange={(e) => onSelectCase(e.target.value)}
                  className="text-[11px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-md py-1 px-1.5 max-w-[170px] truncate focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.client} ({c.riskPercentage}%)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 font-medium truncate">
                {cases.length} cases indexed • Averis Shared Services
              </div>
            )}
          </div>

          {/* Specialized Agent Persona Selector */}
          <div className="bg-white border-b border-slate-100 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 flex-shrink-0">Persona:</span>
            
            <button
              onClick={() => setSelectedPersona('copilot')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 transition-all ${
                selectedPersona === 'copilot'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Bot className="w-3 h-3" />
              <span>Copilot</span>
            </button>

            <button
              onClick={() => setSelectedPersona('sentix')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 transition-all ${
                selectedPersona === 'sentix'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Brain className="w-3 h-3" />
              <span>Sentix (Empathy)</span>
            </button>

            <button
              onClick={() => setSelectedPersona('chronos')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 transition-all ${
                selectedPersona === 'chronos'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Chronos (SLA)</span>
            </button>

            <button
              onClick={() => setSelectedPersona('aegis')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 transition-all ${
                selectedPersona === 'aegis'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Aegis (Security)</span>
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                    {isAssistant && (
                      <span className="font-bold text-blue-600 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        {msg.persona === 'sentix'
                          ? 'Sentix (Sentiment)'
                          : msg.persona === 'chronos'
                          ? 'Chronos (SLA)'
                          : msg.persona === 'aegis'
                          ? 'Aegis (Compliance)'
                          : 'CalmFlow Copilot'}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                      isAssistant
                        ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                        : 'bg-blue-600 text-white rounded-tr-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans space-y-2">
                      {msg.content}
                    </div>

                    {/* Assistant Action Buttons */}
                    {isAssistant && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium flex items-center gap-1 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        {/* Apply Draft to Case Button (Shown if draft email is suggested) */}
                        {!isGlobalMode && (msg.content.toLowerCase().includes('dear') || msg.content.toLowerCase().includes('hi ') || msg.content.toLowerCase().includes('regards') || msg.content.toLowerCase().includes('sincerely')) && (
                          <button
                            onClick={() => handleApplyToComposer(msg.content, msg.id)}
                            className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                            title="Insert this draft into the Case Response Composer"
                          >
                            {appliedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700 font-bold">Inserted into Composer!</span>
                              </>
                            ) : (
                              <>
                                <FileText className="w-3 h-3 text-blue-600" />
                                <span>Insert into Case Composer</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading / Typing Animation */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1 px-1">
                  <span className="font-bold text-blue-600">CalmFlow Copilot</span>
                  <span>is analyzing...</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-3 shadow-xs flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Synthesizing operational guidance...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="bg-white border-t border-slate-200/80 p-2 overflow-x-auto scrollbar-none flex items-center gap-1.5">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200/70 text-[10px] font-medium whitespace-nowrap transition-colors disabled:opacity-50 cursor-pointer flex-shrink-0"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Chat Input Box */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <textarea
                ref={inputRef}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder={
                  isGlobalMode
                    ? "Ask about overall SLA health, critical cases, Averis policies..."
                    : `Ask about ${activeCase?.client}'s case, de-escalation draft, simulation...`
                }
                className="flex-1 py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none max-h-24"
              />

              <button
                type="submit"
                id="btn-chatbox-send"
                disabled={!inputVal.trim() || isLoading}
                className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center shadow-xs transition-all flex-shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Press <strong>Enter</strong> to send • <strong>Shift+Enter</strong> for new line</span>
              <span className="font-mono text-[9px] text-slate-400">Gemini 3.8 Flash</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
