import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calculator,
  DollarSign,
  Users,
  Clock,
  Calendar,
  Sparkles,
  Info,
  ArrowRight,
  CheckCircle2,
  BookmarkPlus,
  RefreshCw,
} from 'lucide-react';

export const SalaryCalculator: React.FC = () => {
  const { setCurrentView, createHiringRequest, stalls, selectedStallId } = useApp();

  // Inputs
  const [workersCount, setWorkersCount] = useState<number>(2);
  const [hourlyRate, setHourlyRate] = useState<number>(13);
  const [shiftHours, setShiftHours] = useState<number>(8);
  const [breakMinutes, setBreakMinutes] = useState<number>(45);
  const [workingDays, setWorkingDays] = useState<number>(3);
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(5); // 5%

  // Presets
  const applyPreset = (preset: {
    workers: number;
    rate: number;
    hours: number;
    breakMins: number;
    days: number;
  }) => {
    setWorkersCount(preset.workers);
    setHourlyRate(preset.rate);
    setShiftHours(preset.hours);
    setBreakMinutes(preset.breakMins);
    setWorkingDays(preset.days);
  };

  // Math Calculations:
  // Net working hours per worker per day = max(shiftHours - breakMinutes/60, 0)
  const netDailyHoursPerWorker = Math.max(shiftHours - breakMinutes / 60, 0);
  const totalHoursPerWorker = netDailyHoursPerWorker * workingDays;
  const grandTotalWorkingHours = totalHoursPerWorker * workersCount;

  // Base Labour Cost
  const baseLabourCost = grandTotalWorkingHours * hourlyRate;

  // Platform Matching Fee
  const platformFee = (baseLabourCost * platformFeePercent) / 100;

  // Total Estimated Cost
  const totalEstimatedCost = baseLabourCost + platformFee;
  const costPerWorker = workersCount > 0 ? totalEstimatedCost / workersCount : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Salary & Labour Cost Calculator</h1>
            <p className="text-xs text-slate-500">
              Singapore F&B & Retail workforce budget estimation compliant with MOM hour calculations
            </p>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
        <span className="font-semibold text-slate-700 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>F&B Quick Presets:</span>
        </span>

        <button
          onClick={() =>
            applyPreset({ workers: 2, rate: 12, hours: 8, breakMins: 0, days: 3 })
          }
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
        >
          Prompt Example (2 workers × S$12 × 8h × 3d)
        </button>

        <button
          onClick={() =>
            applyPreset({ workers: 4, rate: 13, hours: 8, breakMins: 45, days: 1 })
          }
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
        >
          15 Oct Demo Shift (4 crew × S$13 × 8h)
        </button>

        <button
          onClick={() =>
            applyPreset({ workers: 3, rate: 14, hours: 9, breakMins: 60, days: 2 })
          }
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
        >
          Weekend Peak (3 crew × S$14 × 9h × 2d)
        </button>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Manpower Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Number of Workers */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Number of Temporary / Shift Workers
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={workersCount}
                  onChange={(e) => setWorkersCount(Math.max(1, Number(e.target.value)))}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Hourly Rate (SGD) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hourly Salary Rate (SGD S$/hr)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min={8}
                  max={60}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Math.max(1, Number(e.target.value)))}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Shift Duration */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Shift Duration (Gross Hours)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min={1}
                  max={14}
                  step={0.5}
                  value={shiftHours}
                  onChange={(e) => setShiftHours(Math.max(0.5, Number(e.target.value)))}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Unpaid Break Duration */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Unpaid Break (Minutes)
              </label>
              <input
                type="number"
                min={0}
                max={120}
                step={15}
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Working Days */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Number of Working Days
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={workingDays}
                  onChange={(e) => setWorkingDays(Math.max(1, Number(e.target.value)))}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Platform Service Fee % */}
          <div className="pt-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Platform Service Fee (%)
            </label>
            <div className="flex items-center gap-3">
              {[0, 5, 8, 10].map((fee) => (
                <button
                  key={fee}
                  type="button"
                  onClick={() => setPlatformFeePercent(fee)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                    platformFeePercent === fee
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {fee}% {fee === 5 ? '(Standard)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-900 leading-relaxed">
              <strong>Singapore Employment Act Note:</strong> Shifts exceeding 6 consecutive hours require at least a 45-minute meal break. Daily overtime rates apply if working beyond 8 hours/day or 44 hours/week.
            </p>
          </div>
        </div>

        {/* Right Output Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Estimated Cost Breakdown</h2>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                SGD (S$)
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Net Working Hours / Worker / Day:</span>
                <span className="font-mono font-bold text-slate-900">
                  {netDailyHoursPerWorker.toFixed(2)} hrs
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Total Working Hours (All Workers):</span>
                <span className="font-mono font-bold text-slate-900">
                  {grandTotalWorkingHours.toFixed(1)} hrs
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Base Wage ({workersCount} workers × S${hourlyRate}/hr):</span>
                <span className="font-mono font-bold text-slate-900">
                  S${baseLabourCost.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Cost Per Individual Worker:</span>
                <span className="font-mono font-bold text-slate-900">
                  S${costPerWorker.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-slate-100">
                <span>ShiftMate Service Fee ({platformFeePercent}%):</span>
                <span className="font-mono font-semibold">
                  S${platformFee.toFixed(2)}
                </span>
              </div>

              {/* Total Estimated Cost Box */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200 mt-3">
                <span className="text-xs font-semibold text-teal-900 block mb-1">
                  Total Estimated Labour Cost
                </span>
                <div className="text-2xl font-bold font-mono text-teal-950">
                  S${totalEstimatedCost.toFixed(2)}
                </div>
                <p className="text-[10px] text-teal-700 mt-1">
                  Formula: {workersCount} workers × S${hourlyRate} × {netDailyHoursPerWorker.toFixed(1)}h × {workingDays}d + {platformFeePercent}% fee
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[10px] text-slate-400 italic leading-relaxed text-center">
              *Clearly labeled as estimates for planning and budgeting. Final payroll depends on verified digital timesheet clock-ins and applicable statutory CPF contributions.
            </p>

            <button
              onClick={() => setCurrentView('temp_hiring')}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Convert to Temporary Hiring Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
