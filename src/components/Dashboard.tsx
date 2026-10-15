import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  Calendar,
  Users,
  UserCheck,
  AlertTriangle,
  Clock,
  DollarSign,
  ArrowRight,
  Zap,
  Sparkles,
  CheckCircle,
  Building2,
  MapPin,
  CalendarDays,
  FileSpreadsheet,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    company,
    stalls,
    shifts,
    hiringRequests,
    currentDate,
    setCurrentDate,
    setCurrentView,
    getShiftStaffingStatus,
    selectedStallId,
    setSelectedStallId,
  } = useApp();

  // Filter shifts for current date or selected stall
  const activeStall = stalls.find((s) => s.id === selectedStallId) || stalls[0];
  const todayShifts = shifts.filter((s) => s.date === currentDate);
  const stallShifts = shifts.filter((s) => s.stallId === selectedStallId);

  // Metrics calculations
  const totalStalls = stalls.length;
  const todayShiftsCount = todayShifts.length;

  const todayRequiredHeadcount = todayShifts.reduce(
    (acc, curr) => acc + curr.requiredHeadcount,
    0
  );

  const todayConfirmedWorkers = todayShifts.reduce((acc, curr) => {
    return acc + curr.assignedStaff.filter((s) => s.status === 'confirmed').length;
  }, 0);

  const todayShortage = Math.max(todayRequiredHeadcount - todayConfirmedWorkers, 0);

  const pendingTempRequests = hiringRequests.filter(
    (r) => r.status === 'open' || r.status === 'pending_acceptance'
  ).length;

  // Estimated labour cost for today's shifts (SGD)
  const todayEstimatedCost = todayShifts.reduce((total, shift) => {
    const [startH, startM] = shift.startTime.split(':').map(Number);
    const [endH, endM] = shift.endTime.split(':').map(Number);
    const durationHours = Math.max(
      (endH * 60 + endM - (startH * 60 + startM) - shift.breakMinutes) / 60,
      0
    );
    // Cost of confirmed staff
    const confirmed = shift.assignedStaff.filter((s) => s.status === 'confirmed');
    const shiftCost = confirmed.reduce((cTotal, staff) => {
      return cTotal + staff.hourlyRate * durationHours;
    }, 0);
    return total + shiftCost;
  }, 0);

  // Shifts with shortage
  const shiftsWithShortage = todayShifts.filter((s) => {
    const { shortage } = getShiftStaffingStatus(s);
    return shortage > 0;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Operations Dashboard</h1>
            <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
              Live Overview
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {company.name} · Viewing date: <span className="font-semibold text-slate-800">{currentDate}</span>
          </p>
        </div>

        {/* Quick Date & Stall Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setCurrentDate('2026-10-15')}
            className="px-2.5 py-1.5 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 text-xs font-semibold hover:bg-teal-100 transition-colors"
            title="Jump to the demonstration scenario date"
          >
            15 Oct 2026 (Demo Day)
          </button>
        </div>
      </div>

      {/* Emergency Alert Banner if there are Shortages */}
      {shiftsWithShortage.length > 0 && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/90 text-rose-950 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-rose-900">
                  Manpower Shortage Detected ({todayShortage} Staff Needed)
                </span>
                <span className="text-[10px] bg-rose-200/80 text-rose-900 font-bold px-1.5 py-0.5 rounded uppercase">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-rose-700 mt-0.5">
                {shiftsWithShortage[0].taskTitle} on {shiftsWithShortage[0].date} ({shiftsWithShortage[0].startTime}–
                {shiftsWithShortage[0].endTime}) has only{' '}
                {shiftsWithShortage[0].assignedStaff.filter((s) => s.status === 'confirmed').length} of{' '}
                {shiftsWithShortage[0].requiredHeadcount} confirmed workers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCurrentView('emergency_replacement')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Find Replacement Now</span>
            </button>
          </div>
        </div>
      )}

      {/* 7 Summary Cards (Module 7) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Card 1: Active Stalls */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Active Stalls</span>
            <Store className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">{totalStalls}</p>
          <p className="text-[10px] text-slate-400 mt-1 truncate">ABC Chicken Rice etc.</p>
        </div>

        {/* Card 2: Today's Shifts */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Today's Shifts</span>
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">{todayShiftsCount}</p>
          <p className="text-[10px] text-slate-400 mt-1">Scheduled for {currentDate}</p>
        </div>

        {/* Card 3: Required Headcount */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Required Headcount</span>
            <Users className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">{todayRequiredHeadcount}</p>
          <p className="text-[10px] text-slate-400 mt-1">Total slots needed</p>
        </div>

        {/* Card 4: Confirmed Workers */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Confirmed Workers</span>
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-600">{todayConfirmedWorkers}</p>
          <p className="text-[10px] text-slate-400 mt-1">Confirmed on duty</p>
        </div>

        {/* Card 5: Manpower Shortage */}
        <div
          className={`p-3.5 rounded-xl border shadow-xs ${
            todayShortage > 0
              ? 'border-rose-200 bg-rose-50/50'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Shortage</span>
            <AlertTriangle
              className={`w-3.5 h-3.5 ${
                todayShortage > 0 ? 'text-rose-600' : 'text-slate-400'
              }`}
            />
          </div>
          <p
            className={`text-xl font-bold ${
              todayShortage > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {todayShortage}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {todayShortage > 0 ? 'Immediate filling required' : 'Fully covered'}
          </p>
        </div>

        {/* Card 6: Pending Temp Staff Requests */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Pending Requests</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-amber-600">{pendingTempRequests}</p>
          <p className="text-[10px] text-slate-400 mt-1">Awaiting worker acceptance</p>
        </div>

        {/* Card 7: Estimated Labour Cost */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Est. Labour Cost</span>
            <DollarSign className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">
            S${todayEstimatedCost.toFixed(0)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">SGD for confirmed shifts</p>
        </div>
      </div>

      {/* Main Grid: Staffing Headcount Visualizer & Today's Shift Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Shift Status & Visual Progress Bar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Today's Shift Roster ({currentDate})
                </h2>
                <p className="text-xs text-slate-500">
                  Visual headcount status and real-time shortage tracking
                </p>
              </div>

              <button
                onClick={() => setCurrentView('staff_scheduling')}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                <span>Open Scheduler</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual Headcount Comparison Meter */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 mb-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-700">Daily Staffing Fulfillment</span>
                <span className="font-mono font-bold text-slate-900">
                  {todayConfirmedWorkers} of {todayRequiredHeadcount} filled (
                  {todayRequiredHeadcount > 0
                    ? Math.round((todayConfirmedWorkers / todayRequiredHeadcount) * 100)
                    : 100}
                  %)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${
                      todayRequiredHeadcount > 0
                        ? Math.min((todayConfirmedWorkers / todayRequiredHeadcount) * 100, 100)
                        : 0
                    }%`,
                  }}
                  title={`Confirmed: ${todayConfirmedWorkers}`}
                />
                {todayShortage > 0 && (
                  <div
                    className="h-full bg-rose-400 transition-all duration-500 animate-pulse"
                    style={{
                      width: `${(todayShortage / todayRequiredHeadcount) * 100}%`,
                    }}
                    title={`Shortage: ${todayShortage}`}
                  />
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Confirmed Staff ({todayConfirmedWorkers})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span>Unfilled Shortage ({todayShortage})</span>
                </div>
              </div>
            </div>

            {/* List of Today's Shifts */}
            <div className="space-y-3">
              {todayShifts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No shifts scheduled for this date. Click "Open Scheduler" to create shifts.
                </div>
              ) : (
                todayShifts.map((shift) => {
                  const { status, confirmedCount, shortage, color, label } =
                    getShiftStaffingStatus(shift);
                  const stall = stalls.find((s) => s.id === shift.stallId);

                  return (
                    <div
                      key={shift.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">
                              {shift.taskTitle}
                            </h3>
                            {/* Status label as subtle text */}
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                                color === 'emerald'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : color === 'amber'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {label}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-mono text-slate-700">
                                {shift.startTime} – {shift.endTime}
                              </span>
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{stall?.name || 'Stall'}</span>
                            </span>
                            <span>·</span>
                            <span>Rate: S${shift.hourlyRate}/hr</span>
                          </div>
                        </div>

                        {/* Headcount pill & Actions */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-900 font-mono">
                              {confirmedCount} / {shift.requiredHeadcount} Staff
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {shortage > 0 ? (
                                <span className="text-rose-600 font-medium">
                                  Shortage: {shortage}
                                </span>
                              ) : (
                                <span className="text-emerald-600">Complete</span>
                              )}
                            </p>
                          </div>

                          {shortage > 0 && (
                            <button
                              onClick={() => setCurrentView('emergency_replacement')}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1 transition-all"
                            >
                              <Zap className="w-3 h-3" />
                              <span>Find Replacement</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Confirmed Personnel */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-500">
                          Assigned Staff:
                        </span>
                        {shift.assignedStaff.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">None assigned yet</span>
                        ) : (
                          shift.assignedStaff.map((staff) => (
                            <div
                              key={staff.workerId}
                              className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                                staff.status === 'confirmed'
                                  ? staff.workerType === 'temporary'
                                    ? 'bg-teal-50 border-teal-200 text-teal-800'
                                    : 'bg-slate-50 border-slate-200 text-slate-800'
                                  : 'bg-rose-50 border-rose-200 text-rose-700 line-through'
                              }`}
                            >
                              <span>{staff.workerName}</span>
                              <span className="text-[10px] text-slate-400">
                                ({staff.workerType === 'temporary' ? 'Temp' : 'Permanent'})
                              </span>
                              {staff.status === 'reported_absent' && (
                                <span className="text-[10px] text-rose-600 font-semibold no-underline">
                                  [MC]
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Pending Requests */}
        <div className="space-y-4">
          {/* Quick Shortcuts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => setCurrentView('staff_scheduling')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Create New Shift</p>
                    <p className="text-[11px] text-slate-500">Schedule tasks & assign staff</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setCurrentView('temp_hiring')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Hire Temporary Staff</p>
                    <p className="text-[11px] text-slate-500">Post single or multi-day requests</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setCurrentView('salary_calculator')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Labour Cost Calculator</p>
                    <p className="text-[11px] text-slate-500">Estimate worker & platform fees</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Pending Temporary Staff Requests Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Hiring Requests</h2>
              <button
                onClick={() => setCurrentView('temp_hiring')}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {hiringRequests.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No hiring requests posted.</p>
              ) : (
                hiringRequests.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{req.jobRole}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          req.status === 'filled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'partially_filled'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {req.status === 'pending_acceptance' ? 'Pending Offers' : req.status}
                      </span>
                    </div>

                    <p className="text-slate-500 text-[11px] mt-1">
                      {req.startDate} · {req.startTime}–{req.endTime} · S${req.hourlySalary}/hr
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-200/60 pt-1.5">
                      <span>Accepted: {req.acceptedWorkerIds.length} / {req.requiredHeadcount}</span>
                      <span>Invited: {req.appliedWorkerIds.length}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
