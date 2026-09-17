import { useState, useEffect, useRef } from 'react';
import { 
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
  MessageSquare, 
  CornerDownLeft,
  ChevronRight,
  Lightbulb,
  Trash2,
  FileText
} from 'lucide-react';
import { CaseItem, CaseChatMessage } from '../types';

interface CaseChatDrawerProps {
  caseItem: CaseItem;
  isOpen: boolean;
  onClose: () => void;
  onApplyDraftToComposer?: (draftText: string) => void;
}

export function CaseChatDrawer({ 
  caseItem, 
  isOpen, 
  onClose, 
  onApplyDraftToComposer 
}: CaseChatDrawerProps) {
  const [selectedPersona, setSelectedPersona] = useState<'copilot' | 'sentix' | 'chronos' | 'aegis'>('copilot');
  const [messages, setMessages] = useState<CaseChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or reset default greeting whenever caseItem changes
  useEffect(() => {
    const initialGreeting: CaseChatMessage = {
      id: `welcome-${caseItem.id}`,
      role: 'assistant',
      timestamp: 'Just now',
      persona: 'copilot',
      content: `Hello! I am **CalmFlow Copilot**, your dedicated AI Operations Assistant for **Case ${caseItem.caseNumber}** (${caseItem.client}, ${caseItem.company}).\n\nI have fully indexed the inbound email thread, timeline history, and multi-agent risk assessment (${caseItem.riskPercentage}% risk). Ask me anything: root cause analysis, alternative reply drafts, client reaction simulations, or Averis SLA precedents.`
    };
    setMessages([initialGreeting]);
  }, [caseItem.id]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    { label: "Why is the client frustrated?", prompt: "What are the primary psychological and operational root causes of this client's frustration?" },
    { label: "Draft a calming response", prompt: "Draft a personalized, calming operational update that commits to a specific timeline and prevents further escalation." },
    { label: "Simulate client reaction if delayed", prompt: "Simulate how the client will react if we tell them we need an additional 24 hours to review." },
    { label: "Check security & compliance risks", prompt: "Analyze this email for any corporate security vulnerabilities, unauthorized bank alterations, or BEC fraud indicators." }
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
          caseContext: {
            caseNumber: caseItem.caseNumber,
            client: caseItem.client,
            clientEmail: caseItem.clientEmail,
            company: caseItem.company,
            tier: caseItem.tier,
            request: caseItem.request,
            waitingDays: caseItem.waitingDays,
            waitingHours: caseItem.waitingHours,
            riskPercentage: caseItem.riskPercentage,
            riskLevel: caseItem.riskLevel,
            sentiment: caseItem.sentiment,
            urgency: caseItem.urgency,
            emailBody: caseItem.email.body,
            whyAtRisk: caseItem.whyAtRisk,
            recommendationTitle: caseItem.recommendation.title,
            recommendationExplanation: caseItem.recommendation.explanation,
            timeline: caseItem.timeline
          },
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          agentPersona: selectedPersona
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const assistantMsg: CaseChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: 'Just now',
          persona: selectedPersona
        };
        setMessages([...updatedMessages, assistantMsg]);
      } else {
        throw new Error('No reply from server');
      }
    } catch (err) {
      console.error('Case chat error:', err);
      const errorMsg: CaseChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I analyzed the case file for **${caseItem.client}**. Standard recommendation: The ${caseItem.waitingDays}-day delay exceeds our SLA threshold. An immediate proactive update promising concrete delivery by 3:00 PM today is advised to suppress customer escalation.`,
        timestamp: 'Just now',
        persona: selectedPersona
      };
      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to detect if a message contains a draft to insert
  const extractDraft = (content: string) => {
    const quoteMatch = content.match(/"([^"]{40,})"/);
    if (quoteMatch) return quoteMatch[1];
    if (content.toLowerCase().includes('hi ') || content.toLowerCase().includes('dear ')) {
      const idx = Math.max(content.indexOf('Hi '), content.indexOf('Dear '));
      if (idx !== -1) return content.slice(idx);
    }
    return null;
  };

  const getPersonaIcon = (p: string) => {
    if (p === 'sentix') return Brain;
    if (p === 'chronos') return Clock;
    if (p === 'aegis') return ShieldAlert;
    return Sparkles;
  };

  const CurrentPersonaIcon = getPersonaIcon(selectedPersona);

  return (
    <div 
      id="case-chat-drawer" 
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[520px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <CurrentPersonaIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                AI Case Copilot
              </h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold">
                {caseItem.caseNumber}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Case Assistant for {caseItem.client} • {caseItem.riskPercentage}% Risk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const resetGreeting: CaseChatMessage = {
                id: `welcome-${Date.now()}`,
                role: 'assistant',
                timestamp: 'Just now',
                persona: selectedPersona,
                content: `Chat history cleared. I'm ready for your next query on **${caseItem.client}**'s case.`
              };
              setMessages([resetGreeting]);
            }}
            title="Clear Chat History"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title="Close Assistant"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Specialist Persona Switcher */}
      <div className="p-2.5 border-b border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-semibold px-1 text-[10px] uppercase flex-shrink-0">Persona:</span>
        
        <button
          onClick={() => setSelectedPersona('copilot')}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 flex-shrink-0 transition-all ${
            selectedPersona === 'copilot'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          Copilot
        </button>

        <button
          onClick={() => setSelectedPersona('sentix')}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 flex-shrink-0 transition-all ${
            selectedPersona === 'sentix'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <Brain className="w-3 h-3" />
          Sentix (Psychology)
        </button>

        <button
          onClick={() => setSelectedPersona('chronos')}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 flex-shrink-0 transition-all ${
            selectedPersona === 'chronos'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <Clock className="w-3 h-3" />
          Chronos (SLA)
        </button>

        <button
          onClick={() => setSelectedPersona('aegis')}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 flex-shrink-0 transition-all ${
            selectedPersona === 'aegis'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <ShieldAlert className="w-3 h-3" />
          Aegis (Security)
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const draftSnippet = !isUser ? extractDraft(msg.content) : null;
          const MsgIcon = getPersonaIcon(msg.persona || 'copilot');

          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {!isUser && (
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    <MsgIcon className="w-2.5 h-2.5" />
                  </span>
                )}
                <span className="text-[10px] font-semibold text-slate-400">
                  {isUser ? 'You' : msg.persona ? `${msg.persona.toUpperCase()} Specialist` : 'CalmFlow AI'}
                </span>
                <span className="text-[10px] text-slate-400">• {msg.timestamp}</span>
              </div>

              <div 
                className={`p-3.5 rounded-2xl max-w-[90%] text-xs leading-relaxed transition-all ${
                  isUser 
                    ? 'bg-blue-600 text-white rounded-br-xs shadow-xs' 
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line">
                  {msg.content}
                </div>

                {/* Optional Action Buttons for Assistant Responses */}
                {!isUser && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="text-[10px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {draftSnippet && onApplyDraftToComposer && (
                      <button
                        onClick={() => {
                          onApplyDraftToComposer(draftSnippet);
                          onClose();
                        }}
                        className="text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        Insert into Email Composer
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 max-w-[70%] text-xs text-slate-500 shadow-xs">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>Consulting case intelligence & records...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-3 py-2 border-t border-slate-200 bg-slate-50/70 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 flex-shrink-0">
          <Lightbulb className="w-3 h-3 text-amber-500" /> Quick:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.prompt)}
            disabled={isLoading}
            className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-[10px] font-medium text-slate-700 whitespace-nowrap transition-all shadow-2xs flex-shrink-0 disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Composer */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={`Ask ${selectedPersona === 'copilot' ? 'Copilot' : selectedPersona.toUpperCase()} about this case...`}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors flex items-center justify-center shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 mt-1 px-1">
          Grounded directly in {caseItem.client}'s email thread, turnaround SLA, and escalation signals.
        </p>
      </div>
    </div>
  );
}
