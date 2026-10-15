import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings as SettingsIcon,
  RotateCcw,
  Database,
  Building,
  Clock,
  DollarSign,
  MapPin,
  CheckCircle,
  HelpCircle,
  PlayCircle,
  BookOpen,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { company, resetToDemo, setCurrentView, setCurrentRole, setSelectedTempWorkerId } = useApp();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900">Application Settings & Demo Guide</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure business operating defaults, review storage persistence, and follow the interactive demo guide
        </p>
      </div>

      {/* Classroom Demonstration Walkthrough Card */}
      <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-teal-950 text-white p-6 rounded-2xl shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-teal-400" />
          <h2 className="text-base font-bold text-white">Live Classroom Demo Walkthrough</h2>
          <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2 py-0.5 rounded-full font-bold">
            Vibe Coding Showcase
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Follow these sequential steps during your live presentation to demonstrate the complete full-stack workflow:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-teal-300">
              <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center text-[11px]">
                1
              </span>
              <span>Initial Shortage Setup</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Open <strong>Dashboard</strong> or <strong>Staff Scheduling</strong> for <strong>15 Oct 2026</strong>.
              Notice the <em>ABC Chicken Rice</em> Service Crew shift: <strong>Required: 4, Assigned: 2, Shortage: 2</strong> with an orange alert.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-teal-300">
              <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center text-[11px]">
                2
              </span>
              <span>Emergency Replacement</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Click <strong>"Find Replacement"</strong>. Review candidate compatibility scores, WSQ Food Safety certifications, and proximity to Tampines.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-teal-300">
              <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center text-[11px]">
                3
              </span>
              <span>Worker Offer Acceptance</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Switch role to <strong>Temporary Worker (Marcus Tan or Chloe Lim)</strong> in the top header.
              Go to <strong>Shift Offers</strong> and click <strong>"Accept Shift"</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-teal-300">
              <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center text-[11px]">
                4
              </span>
              <span>Roster Turns Green</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Switch back to <strong>Company Admin</strong>. Once 2 workers accept, the shift turns <strong>Fully Staffed (Green)</strong>, shortage drops to 0, and labour cost updates!
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              resetToDemo();
              setCurrentView('dashboard');
            }}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo to Start Fresh</span>
          </button>
        </div>
      </div>

      {/* System Parameters & Compliance */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Operating Standards & Localization
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-800 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Singapore Timezone</span>
            </div>
            <p className="text-slate-500 font-mono">Asia/Singapore (SGT, UTC+8)</p>
            <p className="text-[10px] text-slate-400 mt-1">24-hour format strictly enforced</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-800 mb-1">
              <DollarSign className="w-4 h-4 text-teal-600" />
              <span>Currency & Billing</span>
            </div>
            <p className="text-slate-500 font-mono">SGD (S$ - Singapore Dollars)</p>
            <p className="text-[10px] text-slate-400 mt-1">PayNow / FAST disbursement ready</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-800 mb-1">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Data Persistence</span>
            </div>
            <p className="text-slate-500">HTML5 LocalStorage (Demo Store)</p>
            <p className="text-[10px] text-slate-400 mt-1">Preserved between browser reloads</p>
          </div>
        </div>
      </div>

      {/* Demo Reset Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Restore Factory Demo Dataset</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Reset all shifts, stalls, staff, and job requests back to the original October 15, 2026 Singapore demo scenario.
          </p>
        </div>

        <button
          onClick={resetToDemo}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset All Data</span>
        </button>
      </div>
    </div>
  );
};
