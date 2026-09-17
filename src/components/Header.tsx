import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  User, 
  SlidersHorizontal, 
  ChevronDown, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';
import { CaseItem } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  cases: CaseItem[];
  onOpenSimulator: () => void;
  onResetDemoData: () => void;
  onToggleChatbox?: () => void;
}

export function Header({
  searchQuery,
  setSearchQuery,
  selectedCaseId,
  onSelectCase,
  cases,
  onOpenSimulator,
  onResetDemoData,
  onToggleChatbox
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const scenarioRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (scenarioRef.current && !scenarioRef.current.contains(event.target as Node)) {
        setShowScenarioMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 'n-1',
      title: 'High Escalation Risk: Sarah Tan (91%)',
      time: '12m ago',
      type: 'escalation',
      desc: 'Generic auto-reply suppressed. Human intervention recommended.'
    },
    {
      id: 'n-2',
      title: 'Sensitive Security Safeguard: Robert Chen',
      time: '25m ago',
      type: 'security',
      desc: 'Bank account routing change flagged for dual authorization.'
    },
    {
      id: 'n-3',
      title: 'Proactive Update Delivered: Marcus Vance',
      time: '1h ago',
      type: 'success',
      desc: 'Tax exemption certificate sent. Escalation averted.'
    }
  ];

  const currentCase = cases.find(c => c.id === selectedCaseId);

  return (
    <header 
      id="calmflow-top-header"
      className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30"
    >
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-input-header"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, ticket CF-..., invoice, or keyword..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center gap-3">
        {/* Scenario Quick-Switcher (Crucial for Demo Judges) */}
        <div className="relative" ref={scenarioRef}>
          <button
            id="btn-scenario-switcher"
            onClick={() => setShowScenarioMenu(!showScenarioMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100/70 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Scenario:</span>
            <span className="max-w-[140px] truncate font-medium text-blue-900">
              {currentCase ? currentCase.client : 'Select Case'}
            </span>
            <ChevronDown className="w-3 h-3 text-blue-700" />
          </button>

          {showScenarioMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Hackathon Demo Scenarios
              </div>
              
              <div className="p-1 space-y-1">
                {cases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCase(c.id);
                      setShowScenarioMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      c.id === selectedCaseId
                        ? 'bg-blue-50 text-blue-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900">{c.client}</span>
                        <span className="text-[10px] text-slate-400">({c.request})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[190px]">
                        {c.status === 'Escalation' && '🔴 High Escalation (91%)'}
                        {c.status === 'At Risk' && '🟠 At Risk (74%)'}
                        {c.status === 'Processing' && '🟢 Normal Restraint (21%)'}
                        {c.status === 'Human Verification' && '🛡️ Sensitive Security Request'}
                        {c.status === 'Delayed' && '🟡 Delayed SLA (68%)'}
                        {c.status === 'Resolved' && '✅ Averted Escalation'}
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      c.riskPercentage >= 80 
                        ? 'bg-rose-100 text-rose-700' 
                        : c.riskPercentage >= 50 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {c.riskPercentage}%
                    </span>
                  </button>
                ))}
              </div>

              <div className="px-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowScenarioMenu(false);
                    onOpenSimulator();
                  }}
                  className="w-full text-center py-1.5 px-2 rounded text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  Test Any Custom Email...
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Chatbox Header Trigger Button */}
        {onToggleChatbox && (
          <button
            id="btn-header-ai-chatbox"
            onClick={onToggleChatbox}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 text-blue-700 hover:bg-blue-100/70 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            title="Open AI Chatbox Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span className="hidden sm:inline">AI Chatbox</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
          </button>
        )}

        {/* Reset Demo State Button */}
        <button
          id="btn-reset-demo"
          onClick={onResetDemoData}
          title="Reset demonstration data to default state"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            id="btn-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Live Escalation Alerts</span>
                <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-semibold">2 urgent</span>
              </div>
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors text-xs">
                    <div className="flex items-start gap-2">
                      {n.type === 'escalation' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 mt-0.5 flex-shrink-0" />}
                      {n.type === 'security' && <ShieldAlert className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />}
                      {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{n.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <span className="text-[11px] text-slate-400">All alerts monitored by CalmFlow AI</span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="pl-3 border-l border-slate-200 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100">
            AV
          </div>
          <div className="hidden md:block leading-tight">
            <p className="text-xs font-semibold text-slate-900">Operations Team</p>
            <p className="text-[10px] text-slate-500 font-medium">Averis Shared Services</p>
          </div>
        </div>
      </div>
    </header>
  );
}
