import { 
  LayoutDashboard, 
  Inbox, 
  AlertTriangle, 
  AlertOctagon, 
  BarChart3, 
  Sliders, 
  ShieldAlert,
  Sparkles,
  Layers,
  ChevronRight,
  Bot,
  Cloud
} from 'lucide-react';
import { CaseItem } from '../types';

interface SidebarProps {
  currentView: 'dashboard' | 'inbox' | 'at-risk' | 'escalated' | 'case-detail' | 'analytics' | 'settings' | 'multi-agent' | 'cloud-architecture';
  setCurrentView: (view: 'dashboard' | 'inbox' | 'at-risk' | 'escalated' | 'analytics' | 'settings' | 'multi-agent' | 'cloud-architecture') => void;
  cases: CaseItem[];
  onOpenSimulator: () => void;
  onToggleChatbox?: () => void;
  isChatboxOpen?: boolean;
}

export function Sidebar({ 
  currentView, 
  setCurrentView, 
  cases, 
  onOpenSimulator,
  onToggleChatbox,
  isChatboxOpen
}: SidebarProps) {
  const atRiskCount = cases.filter(c => c.status === 'At Risk' || (c.riskPercentage >= 70 && c.riskPercentage < 90)).length;
  const escalatedCount = cases.filter(c => c.status === 'Escalation' || c.status === 'Human Verification' || c.riskPercentage >= 90).length;
  const unreadCount = cases.filter(c => c.unread).length;

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'inbox' as const,
      label: 'Inbox',
      icon: Inbox,
      badge: unreadCount > 0 ? unreadCount : null,
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'at-risk' as const,
      label: 'At Risk',
      icon: AlertTriangle,
      badge: atRiskCount,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'escalated' as const,
      label: 'Escalated',
      icon: AlertOctagon,
      badge: escalatedCount,
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    {
      id: 'multi-agent' as const,
      label: 'Multi-Agent & ML',
      icon: Bot,
      badge: '4 Agents',
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'cloud-architecture' as const,
      label: 'Cloud Architecture',
      icon: Cloud,
      badge: 'GCP Live',
      badgeColor: 'bg-sky-100 text-sky-800'
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Sliders,
      badge: null
    }
  ];

  return (
    <aside 
      id="calmflow-sidebar" 
      className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between select-none h-screen sticky top-0"
    >
      <div>
        {/* Logo and Brand Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">CalmFlow</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">AI</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-none mt-0.5">Averis × Monash 2026</p>
            </div>
          </div>

          <div className="mt-3.5 px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 flex items-center justify-between">
            <span className="font-medium text-slate-700">Shared Services Ops</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-600 uppercase">
            Operations Console
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-600'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* AI Chatbox Copilot Launcher */}
        {onToggleChatbox && (
          <div className="px-3 pt-2">
            <button
              id="btn-open-chatbox-sidebar"
              onClick={onToggleChatbox}
              className={`w-full text-left p-3 rounded-lg border transition-all text-xs group cursor-pointer ${
                isChatboxOpen
                  ? 'border-blue-400 bg-blue-50 text-blue-900 shadow-xs'
                  : 'border-indigo-200/90 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 hover:from-indigo-100 hover:to-blue-100 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between font-bold mb-1">
                <span className="flex items-center gap-1.5 text-indigo-900">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  AI Chatbox Copilot
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  isChatboxOpen 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-indigo-600 text-white'
                }`}>
                  {isChatboxOpen ? 'Active' : 'Chat'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Ask questions, de-escalate clients, or draft calming replies in real time.
              </p>
            </button>
          </div>
        )}

        {/* Quick Simulator Launcher for Live Demo */}
        <div className="px-3 pt-2">
          <button
            id="btn-open-simulator-sidebar"
            onClick={onOpenSimulator}
            className="w-full text-left p-3 rounded-lg border border-blue-200/80 bg-blue-50/50 hover:bg-blue-50 transition-all text-xs group"
          >
            <div className="flex items-center justify-between font-semibold text-blue-900 mb-1">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Live AI Case Tester
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-blue-700/80 leading-snug">
              Simulate any incoming client email with instant AI escalation analysis.
            </p>
          </button>
        </div>
      </div>

      {/* Bottom Mission Card */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
          <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
            Core Mandate
          </div>
          <p className="text-[11px] text-slate-600 italic leading-relaxed">
            “Predict frustration.<br />Prevent escalation.”
          </p>
          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-600">
            <span>Averis Shared Services</span>
            <span className="font-mono">v2.4.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
