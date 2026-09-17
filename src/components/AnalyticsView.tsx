import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Sparkles,
  Users,
  Building
} from 'lucide-react';

export function AnalyticsView() {
  const metrics = [
    {
      title: 'Escalation Prevention Rate',
      value: '94.2%',
      trend: '+6.4% vs Q2',
      desc: 'High-risk cases defused before executive escalation',
      icon: ShieldCheck,
      color: 'emerald'
    },
    {
      title: 'Avg. First Proactive Touch',
      value: '3.2 hrs',
      trend: '-52% faster',
      desc: 'Average turnaround on proactive status commitments',
      icon: Clock,
      color: 'blue'
    },
    {
      title: 'False Escalation Suppression',
      value: '89.7%',
      trend: 'Zero false alarms',
      desc: 'Normal low-risk inquiries allowed to flow automatically',
      icon: CheckCircle2,
      color: 'emerald'
    },
    {
      title: 'Client Frustration Index',
      value: '14.1',
      trend: '-38% down',
      desc: 'Overall sentiment irritation score across shared services',
      icon: TrendingUp,
      color: 'blue'
    }
  ];

  const sharedServiceUnits = [
    { name: 'Accounts Payable & Invoicing', cases: 54, preventionRate: '96.1%', riskAvg: '24%' },
    { name: 'Procurement & Vendor Operations', cases: 38, preventionRate: '93.5%', riskAvg: '28%' },
    { name: 'Treasury & Disbursements', cases: 22, preventionRate: '98.2%', riskAvg: '18%' },
    { name: 'IT Shared Services & IAM', cases: 28, preventionRate: '91.0%', riskAvg: '32%' }
  ];

  return (
    <div id="analytics-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Averis Shared Services • Operations Intelligence
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Escalation Prevention & Operations Analytics
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Quantifiable ROI and client retention impact across shared services operations
          </p>
        </div>
        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
          <span className="font-semibold text-slate-900">Evaluation Window:</span> Sept 2026 Live Hackathon Benchmark
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  {m.title}
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{m.value}</span>
                <span className="text-xs font-semibold text-emerald-700">{m.trend}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-snug">{m.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Shared Services Units Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Shared Services Operational Units</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Escalation risk management by functional shared services team
            </p>
          </div>
          <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
            4 Active Units
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-5">Operational Unit</th>
                <th className="py-3 px-4">Active Cases</th>
                <th className="py-3 px-4">Escalation Prevention Rate</th>
                <th className="py-3 px-4">Avg Risk Score</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sharedServiceUnits.map((u, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-slate-400" />
                      {u.name}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{u.cases} cases</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-800">{u.preventionRate}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{u.riskAvg}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Optimized
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
