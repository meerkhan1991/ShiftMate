import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Building2,
  Calendar,
  Download,
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { shifts, stalls, getShiftStaffingStatus, company } = useApp();

  // Aggregate metrics
  const totalRequired = shifts.reduce((acc, s) => acc + s.requiredHeadcount, 0);
  const totalConfirmed = shifts.reduce((acc, s) => {
    return acc + s.assignedStaff.filter((st) => st.status === 'confirmed').length;
  }, 0);
  const totalShortage = Math.max(totalRequired - totalConfirmed, 0);
  const fulfillmentRate =
    totalRequired > 0 ? Math.round((totalConfirmed / totalRequired) * 100) : 100;

  // Group shifts by date for interactive visual chart
  const shiftsByDate: { [date: string]: { required: number; confirmed: number; shortage: number } } = {};
  shifts.forEach((shift) => {
    if (!shiftsByDate[shift.date]) {
      shiftsByDate[shift.date] = { required: 0, confirmed: 0, shortage: 0 };
    }
    const { confirmedCount, shortage } = getShiftStaffingStatus(shift);
    shiftsByDate[shift.date].required += shift.requiredHeadcount;
    shiftsByDate[shift.date].confirmed += confirmedCount;
    shiftsByDate[shift.date].shortage += shortage;
  });

  const sortedDates = Object.keys(shiftsByDate).sort();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manpower & Staffing Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Analytics on headcount demand vs. confirmed staffing, fulfillment trends, and labour costs
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Summary</span>
        </button>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Overall Fulfillment</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{fulfillmentRate}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Target: 95%+</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Required Shifts</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalRequired} Slots</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Across {shifts.length} tasks</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Confirmed Workforce</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalConfirmed} Workers</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Permanent & Casual</p>
        </div>

        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/50 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-800">Unfilled Shortages</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">{totalShortage} Slots</p>
          <p className="text-[10px] text-rose-700 mt-0.5">Requires temp backfill</p>
        </div>
      </div>

      {/* Chart: Manpower Requirements vs Confirmed Staffing */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Manpower Demand vs Confirmed Staffing (By Date)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct comparison of headcount needed vs confirmed personnel per shift day
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-600" />
              <span className="text-slate-600">Required Headcount</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-slate-600">Confirmed Assigned</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="space-y-5">
          {sortedDates.map((date) => {
            const data = shiftsByDate[date];
            const maxVal = Math.max(data.required, data.confirmed, 1);

            return (
              <div key={date} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-900 font-bold">
                    {new Date(date).toLocaleDateString('en-SG', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <div className="space-x-3 text-slate-600">
                    <span>
                      Required: <strong className="text-blue-700">{data.required}</strong>
                    </span>
                    <span>
                      Confirmed: <strong className="text-emerald-700">{data.confirmed}</strong>
                    </span>
                    {data.shortage > 0 && (
                      <span className="text-rose-600 font-bold">
                        (Shortage: {data.shortage})
                      </span>
                    )}
                  </div>
                </div>

                {/* Dual Bars */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(data.required / Math.max(maxVal, 6)) * 100}%` }}
                    />
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(data.confirmed / Math.max(maxVal, 6)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown by Outlet / Stall */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-3">Fulfillment by Stall Outlet</h2>
        <div className="divide-y divide-slate-100 text-xs">
          {stalls.map((stall) => {
            const stallShifts = shifts.filter((s) => s.stallId === stall.id);
            const reqCount = stallShifts.reduce((acc, s) => acc + s.requiredHeadcount, 0);
            const confCount = stallShifts.reduce(
              (acc, s) => acc + s.assignedStaff.filter((st) => st.status === 'confirmed').length,
              0
            );

            return (
              <div key={stall.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{stall.name}</p>
                  <p className="text-slate-500">{stall.location}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-900">
                    {confCount} / {reqCount} Filled
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {reqCount > 0 ? Math.round((confCount / reqCount) * 100) : 100}% Staffed
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
