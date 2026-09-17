import { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Bell, 
  Mail, 
  Building, 
  Save, 
  CheckCircle2,
  Lock
} from 'lucide-react';

export function SettingsView() {
  const [escalationThreshold, setEscalationThreshold] = useState(70);
  const [autoSuppressAutoReply, setAutoSuppressAutoReply] = useState(true);
  const [requireHumanReviewAllHighRisk, setRequireHumanReviewAllHighRisk] = useState(true);
  const [slaWarningDays, setSlaWarningDays] = useState(3);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div id="settings-view" className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            CalmFlow AI Operational Rules & Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure escalation detection thresholds, suppression rules, and shared services routing
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-200 flex items-center gap-1.5 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          Save Rules
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Operational settings successfully saved and applied to live monitoring engine.</span>
        </div>
      )}

      {/* Thresholds Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            Escalation Risk Triggers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Define mathematical thresholds for flagging cases as "At Risk" and "Escalation"
          </p>
        </div>

        {/* Escalation Threshold Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">Critical Escalation Alert Threshold</span>
            <span className="font-mono font-bold text-rose-600 text-sm">{escalationThreshold}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            value={escalationThreshold}
            onChange={(e) => setEscalationThreshold(parseInt(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500">
            Cases scoring above {escalationThreshold}% immediately trigger supervisor routing and suppress standard automated acknowledgements.
          </p>
        </div>

        {/* SLA Warning Days */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">SLA Breach Warning Window</span>
            <span className="font-mono font-bold text-amber-600 text-sm">{slaWarningDays} days</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={slaWarningDays}
            onChange={(e) => setSlaWarningDays(parseInt(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500">
            Flags operational inquiries that have remained pending for {slaWarningDays} days without proactive update.
          </p>
        </div>
      </div>

      {/* Safety & Safeguard Policies */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            AI Guardrails & Safeguards
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            CalmFlow AI guarantees human-in-the-loop oversight to protect client relationships
          </p>
        </div>

        <div className="space-y-3">
          {/* Toggle 1 */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer hover:bg-slate-100/50 transition-colors">
            <input
              type="checkbox"
              checked={autoSuppressAutoReply}
              onChange={(e) => setAutoSuppressAutoReply(e.target.checked)}
              className="mt-0.5 accent-blue-600 rounded"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Auto-Suppress Generic Acknowledgements for Frustrated Clients
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Prevents triggering clients with generic "Thank you, your ticket # has been received" replies when high frustration is detected.
              </p>
            </div>
          </label>

          {/* Toggle 2 */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer hover:bg-slate-100/50 transition-colors">
            <input
              type="checkbox"
              checked={requireHumanReviewAllHighRisk}
              onChange={(e) => setRequireHumanReviewAllHighRisk(e.target.checked)}
              className="mt-0.5 accent-blue-600 rounded"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Mandatory Human Verification for High-Risk Responses
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                AI generated responses require explicit operator review and confirmation before transmission.
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
