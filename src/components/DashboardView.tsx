import { 
  AlertTriangle, 
  Clock, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';
import { CaseItem } from '../types';
import { MOCK_KPIS, RISK_DISTRIBUTION } from '../data/initialCases';

interface DashboardViewProps {
  cases: CaseItem[];
  onSelectCase: (caseId: string) => void;
  onNavigateToInbox: (filter?: string) => void;
}

export function DashboardView({ cases, onSelectCase, onNavigateToInbox }: DashboardViewProps) {
  // Sort priority cases: high risk first, then waiting days
  const priorityCases = [...cases].sort((a, b) => b.riskPercentage - a.riskPercentage);

  return (
    <div id="dashboard-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Top Greeting & Operational Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Averis × Monash Hackathon 2026 • AI Escalation Prevention
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Good morning, Operations Team
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Here’s what needs your attention today.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
            <span className="text-slate-600 block text-[11px]">Active Shift Policy</span>
            <span className="font-semibold text-slate-800">SLA 48h / Auto-Suppress &gt; 65%</span>
          </div>
          <button
            id="btn-view-all-inbox"
            onClick={() => onNavigateToInbox()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-200 transition-colors"
          >
            <span>View All Cases</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Active Cases */}
        <div 
          id="kpi-total-active"
          onClick={() => onNavigateToInbox('all')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Active Cases</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Clock className="w-4 h-4 text-slate-700" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{MOCK_KPIS.totalActive}</span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              {MOCK_KPIS.totalActiveTrend}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">Across all shared service units</p>
        </div>

        {/* KPI 2: At-Risk Cases */}
        <div 
          id="kpi-at-risk"
          onClick={() => onNavigateToInbox('at-risk')}
          className="bg-white p-5 rounded-xl border border-amber-200/80 bg-gradient-to-b from-white to-amber-50/20 shadow-xs hover:border-amber-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wide">At-Risk Cases</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-800" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{MOCK_KPIS.atRisk}</span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" />
              {MOCK_KPIS.atRiskTrend}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">Risk score between 50% – 85%</p>
        </div>

        {/* KPI 3: Delayed Cases */}
        <div 
          id="kpi-delayed"
          onClick={() => onNavigateToInbox('delayed')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Delayed Cases</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Clock className="w-4 h-4 text-slate-700" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{MOCK_KPIS.delayed}</span>
            <span className="text-xs font-semibold text-slate-700">
              &gt; 3 days SLA
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">{MOCK_KPIS.delayedTrend}</p>
        </div>

        {/* KPI 4: High-Urgency Cases */}
        <div 
          id="kpi-high-urgency"
          onClick={() => onNavigateToInbox('escalated')}
          className="bg-white p-5 rounded-xl border border-rose-200/80 bg-gradient-to-b from-white to-rose-50/20 shadow-xs hover:border-rose-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-900 uppercase tracking-wide">High-Urgency Cases</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-800">
              <Flame className="w-4 h-4 text-rose-800" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{MOCK_KPIS.highUrgency}</span>
            <span className="text-xs font-semibold text-rose-700">
              Immediate action
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">{MOCK_KPIS.highUrgencyTrend}</p>
        </div>
      </div>

      {/* Middle Section: Client Risk Overview Chart & Distribution */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Client Risk Overview</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Live AI escalation distribution across shared services operation queues
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Low Risk (73%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Medium Risk (16%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              High Risk (11%)
            </span>
          </div>
        </div>

        {/* Visual Stacked Bar Chart */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex p-0.5 gap-0.5">
          <div 
            style={{ width: '73%' }} 
            className="h-full bg-emerald-500 rounded-l-full transition-all duration-500" 
            title="Low Risk: 104 cases (73%)"
          />
          <div 
            style={{ width: '16%' }} 
            className="h-full bg-amber-500 transition-all duration-500" 
            title="Medium Risk: 23 cases (16%)"
          />
          <div 
            style={{ width: '11%' }} 
            className="h-full bg-rose-500 rounded-r-full transition-all duration-500" 
            title="High Risk: 15 cases (11%)"
          />
        </div>

        {/* Breakdown Metric Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
            <div>
              <p className="text-xs font-semibold text-emerald-950">Low Risk Cases</p>
              <p className="text-[11px] text-emerald-800">Standard automated acknowledgement active</p>
            </div>
            <span className="text-lg font-bold text-emerald-800">104</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-100">
            <div>
              <p className="text-xs font-semibold text-amber-950">Medium Risk Cases</p>
              <p className="text-[11px] text-amber-800">Proactive status updates recommended</p>
            </div>
            <span className="text-lg font-bold text-amber-800">23</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50/50 border border-rose-100">
            <div>
              <p className="text-xs font-semibold text-rose-950">High Risk & Escalation</p>
              <p className="text-[11px] text-rose-800">Requires human review & intervention</p>
            </div>
            <span className="text-lg font-bold text-rose-800">15</span>
          </div>
        </div>
      </div>

      {/* Priority Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Priority Cases</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Ranked by AI escalation risk and waiting duration
            </p>
          </div>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            Showing top operational cases
          </span>
        </div>

        {/* Priority Cases Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-5">Client</th>
                <th className="py-3 px-4">Request</th>
                <th className="py-3 px-4">Waiting</th>
                <th className="py-3 px-4">Sentiment</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {priorityCases.slice(0, 5).map((item) => {
                const isHighRisk = item.riskPercentage >= 80;
                const isMediumRisk = item.riskPercentage >= 50 && item.riskPercentage < 80;

                return (
                  <tr
                    key={item.id}
                    id={`priority-row-${item.id}`}
                    onClick={() => onSelectCase(item.id)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    {/* Client */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px] group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {item.client.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {item.client}
                          </p>
                          <p className="text-[11px] text-slate-600 truncate max-w-[160px]">{item.company}</p>
                        </div>
                      </div>
                    </td>

                    {/* Request */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {item.request}
                    </td>

                    {/* Waiting */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className={`inline-flex items-center gap-1 font-medium ${
                        item.waitingDays >= 4 ? 'text-rose-700 font-semibold' : item.waitingDays >= 3 ? 'text-amber-800 font-semibold' : 'text-slate-600'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        {item.waitingDays === 0 ? '< 1 day' : `${item.waitingDays} day${item.waitingDays > 1 ? 's' : ''}`}
                      </span>
                    </td>

                    {/* Sentiment */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        item.sentiment === 'Very Negative'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200/70'
                          : item.sentiment === 'Negative'
                          ? 'bg-amber-50 text-amber-900 border border-amber-200/70'
                          : item.sentiment === 'Positive'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                          : 'bg-slate-100 text-slate-700 border border-slate-200/70'
                      }`}>
                        {item.sentiment}
                      </span>
                    </td>

                    {/* Risk Percentage */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isHighRisk ? 'bg-rose-500' : isMediumRisk ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${item.riskPercentage}%` }}
                          />
                        </div>
                        <span className={`font-bold text-xs ${
                          isHighRisk ? 'text-rose-700' : isMediumRisk ? 'text-amber-800' : 'text-emerald-800'
                        }`}>
                          {item.riskPercentage}%
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.status === 'Escalation'
                          ? 'bg-rose-100 text-rose-800'
                          : item.status === 'At Risk'
                          ? 'bg-amber-100 text-amber-900'
                          : item.status === 'Processing'
                          ? 'bg-blue-50 text-blue-800'
                          : item.status === 'Human Verification'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                        Review
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            CalmFlow AI continuously checks sentiment, intent, waiting times, and multi-turn escalation patterns.
          </span>
          <button 
            onClick={() => onNavigateToInbox()}
            className="font-semibold text-blue-700 hover:text-blue-800"
          >
            View all 142 cases &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
