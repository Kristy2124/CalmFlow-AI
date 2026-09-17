import { useState, useMemo } from 'react';
import { 
  Inbox, 
  Clock, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Filter, 
  ArrowUpDown, 
  Search, 
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Tag,
  Bot
} from 'lucide-react';
import { CaseItem } from '../types';
import { CaseChatDrawer } from './CaseChatDrawer';

interface InboxViewProps {
  cases: CaseItem[];
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  initialFilter?: string;
}

export function InboxView({ cases, selectedCaseId, onSelectCase, initialFilter = 'all' }: InboxViewProps) {
  const [activeTab, setActiveTab] = useState<string>(initialFilter);
  const [sortBy, setSortBy] = useState<'risk' | 'urgency' | 'waiting' | 'sentiment' | 'status'>('risk');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [inboxSearch, setInboxSearch] = useState<string>('');
  const [activeChatCase, setActiveChatCase] = useState<CaseItem | null>(null);

  // Tab counts
  const counts = useMemo(() => ({
    all: cases.length,
    unread: cases.filter(c => c.unread).length,
    'at-risk': cases.filter(c => c.status === 'At Risk' || (c.riskPercentage >= 65 && c.riskPercentage < 85)).length,
    delayed: cases.filter(c => c.status === 'Delayed' || c.waitingDays >= 3).length,
    escalated: cases.filter(c => c.status === 'Escalation' || c.status === 'Human Verification' || c.riskPercentage >= 85).length,
    resolved: cases.filter(c => c.status === 'Resolved').length
  }), [cases]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter(item => {
      // Tab filter
      if (activeTab === 'unread' && !item.unread) return false;
      if (activeTab === 'at-risk' && !(item.status === 'At Risk' || (item.riskPercentage >= 65 && item.riskPercentage < 85))) return false;
      if (activeTab === 'delayed' && !(item.status === 'Delayed' || item.waitingDays >= 3)) return false;
      if (activeTab === 'escalated' && !(item.status === 'Escalation' || item.status === 'Human Verification' || item.riskPercentage >= 85)) return false;
      if (activeTab === 'resolved' && item.status !== 'Resolved') return false;

      // Text search
      if (inboxSearch.trim()) {
        const q = inboxSearch.toLowerCase();
        const match = 
          item.client.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          item.preview.toLowerCase().includes(q) ||
          item.company.toLowerCase().includes(q) ||
          item.caseNumber.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [cases, activeTab, inboxSearch]);

  // Sorted cases
  const sortedCases = useMemo(() => {
    return [...filteredCases].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'risk') {
        comparison = b.riskPercentage - a.riskPercentage;
      } else if (sortBy === 'waiting') {
        comparison = b.waitingDays - a.waitingDays;
      } else if (sortBy === 'urgency') {
        const order = { High: 3, Medium: 2, Low: 1 };
        comparison = order[b.urgency] - order[a.urgency];
      } else if (sortBy === 'sentiment') {
        const order = { 'Very Negative': 4, Negative: 3, Neutral: 2, Positive: 1 };
        comparison = (order[b.sentiment] || 0) - (order[a.sentiment] || 0);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortDirection === 'desc' ? comparison : -comparison;
    });
  }, [filteredCases, sortBy, sortDirection]);

  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'unread', label: 'Unread', count: counts.unread },
    { id: 'at-risk', label: 'At Risk', count: counts['at-risk'] },
    { id: 'delayed', label: 'Delayed', count: counts.delayed },
    { id: 'escalated', label: 'Escalated', count: counts.escalated },
    { id: 'resolved', label: 'Resolved', count: counts.resolved },
  ];

  return (
    <div id="inbox-view" className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden max-w-7xl mx-auto flex flex-col min-h-[640px]">
      {/* Header & Controls Bar */}
      <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">AI-Enhanced Operations Inbox</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              Active Monitoring
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            CalmFlow AI continuously scores sentiment, intent, waiting times, and multi-turn escalation risk
          </p>
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inboxSearch}
              onChange={(e) => setInboxSearch(e.target.value)}
              placeholder="Filter current inbox..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 text-[11px] font-medium">Sort:</span>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="risk">AI Risk Score</option>
              <option value="urgency">Urgency</option>
              <option value="waiting">Waiting Time</option>
              <option value="sentiment">Sentiment</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setSortDirection(d => d === 'desc' ? 'asc' : 'desc')}
              className="text-slate-400 hover:text-slate-600 text-[10px] uppercase font-bold pl-1 border-l border-slate-200"
              title="Toggle sort direction"
            >
              {sortDirection}
            </button>
          </div>
        </div>
      </div>

      {/* Main Inbox Layout: Filter Tabs on Top/Left */}
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Left Filter Navigation Column */}
        <div className="w-full lg:w-56 border-b lg:border-b-0 lg:border-r border-slate-100 p-3 bg-slate-50/50 flex-shrink-0">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">
            Inbox Folders
          </div>
          <div className="space-y-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs">
            <div className="flex items-center gap-1 text-blue-900 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Auto-Suppression Rule
            </div>
            <p className="text-[11px] text-blue-800/80 leading-relaxed">
              When risk &gt; 65%, CalmFlow suppresses blind auto-replies to prevent client frustration.
            </p>
          </div>
        </div>

        {/* Email List Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {sortedCases.length === 0 ? (
            <div className="p-12 text-center">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No cases match this filter</p>
              <p className="text-xs text-slate-400 mt-1">Try switching to the 'All' tab or changing search keywords.</p>
            </div>
          ) : (
            sortedCases.map((item) => {
              const isSelected = item.id === selectedCaseId;
              const isHighRisk = item.riskPercentage >= 80;
              const isMediumRisk = item.riskPercentage >= 50 && item.riskPercentage < 80;

              return (
                <div
                  key={item.id}
                  id={`inbox-row-${item.id}`}
                  onClick={() => onSelectCase(item.id)}
                  className={`p-4 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  {/* Left info: Sender, Subject, Preview */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" title="Unread" />
                      )}
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {item.client}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.caseNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        • {item.company}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-800 truncate mb-1">
                      {item.subject}
                    </p>

                    <p className="text-xs text-slate-500 truncate leading-relaxed">
                      "{item.preview}"
                    </p>
                  </div>

                  {/* Right metadata badges */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 self-start sm:self-center flex-shrink-0">
                    {/* Waiting time badge */}
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        item.waitingDays >= 4 
                          ? 'text-rose-600' 
                          : item.waitingDays >= 3 
                          ? 'text-amber-600' 
                          : 'text-slate-600'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        {item.waitingDays === 0 ? '< 1 day' : `${item.waitingDays} days`}
                      </span>
                      <span className="text-[10px] text-slate-400 block">waiting</span>
                    </div>

                    {/* Sentiment Indicator */}
                    <div className="w-24 text-center">
                      <span className={`inline-block w-full py-0.5 px-2 rounded text-[11px] font-semibold ${
                        item.sentiment === 'Very Negative'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : item.sentiment === 'Negative'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : item.sentiment === 'Positive'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {item.sentiment}
                      </span>
                    </div>

                    {/* AI Escalation Risk Badge */}
                    <div className="w-36">
                      <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                        isHighRisk 
                          ? 'bg-rose-50 border-rose-200 text-rose-800' 
                          : isMediumRisk 
                          ? 'bg-amber-50 border-amber-200 text-amber-800' 
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}>
                        <span className="text-[11px] font-bold flex items-center gap-1">
                          {isHighRisk ? '🔴' : isMediumRisk ? '🟠' : '🟢'} {item.riskPercentage}% risk
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                          {item.status === 'Escalation' ? 'Escalation' : item.status === 'At Risk' ? 'At Risk' : 'Healthy'}
                        </span>
                      </div>
                    </div>

                    <button
                      id={`btn-chat-row-${item.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveChatCase(item);
                      }}
                      title={`Chat with AI Copilot on Case ${item.caseNumber}`}
                      className="py-1 px-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition-colors flex items-center gap-1 text-[11px] font-medium"
                    >
                      <Bot className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">Ask AI</span>
                    </button>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Case Copilot Drawer for Inbox Quick Chat */}
      {activeChatCase && (
        <CaseChatDrawer
          caseItem={activeChatCase}
          isOpen={!!activeChatCase}
          onClose={() => setActiveChatCase(null)}
          onApplyDraftToComposer={() => {
            onSelectCase(activeChatCase.id);
            setActiveChatCase(null);
          }}
        />
      )}
    </div>
  );
}
