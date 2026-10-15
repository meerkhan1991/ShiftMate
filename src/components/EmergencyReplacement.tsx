import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  Zap,
  Users,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Send,
  Star,
  Check,
  UserX,
  AlertCircle,
  ShieldCheck,
  Building2,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { Shift, TempWorker } from '../types';

export const EmergencyReplacement: React.FC = () => {
  const {
    shifts,
    stalls,
    tempWorkers,
    hiringRequests,
    reportAbsence,
    sendRequestToWorker,
    createHiringRequest,
    acceptJobOffer,
    getShiftStaffingStatus,
    setSelectedTempWorkerId,
    setCurrentRole,
    setCurrentView,
    checkWorkerConflict,
    currentDate,
  } = useApp();

  // Find shifts with shortages or reported absences
  const targetShifts = shifts.filter((shift) => {
    const { shortage } = getShiftStaffingStatus(shift);
    const hasAbsent = shift.assignedStaff.some((s) => s.status === 'reported_absent');
    return shortage > 0 || hasAbsent;
  });

  // Selected shift for emergency replacement
  const [selectedShiftId, setSelectedShiftId] = useState<string>(
    targetShifts.length > 0 ? targetShifts[0].id : 'shift-demo-15oct'
  );

  const [absenceReason, setAbsenceReason] = useState('Medical Certificate (MC) - Fever & Flu');
  const [selectedWorkerToMarkAbsent, setSelectedWorkerToMarkAbsent] = useState<string>('');

  const currentShift =
    shifts.find((s) => s.id === selectedShiftId) || shifts[0];
  const stall = stalls.find((s) => s.id === currentShift?.stallId);
  const { status, confirmedCount, shortage, color, label } = currentShift
    ? getShiftStaffingStatus(currentShift)
    : { status: 'no_staff', confirmedCount: 0, shortage: 0, color: 'rose', label: '' };

  // Check matching temporary workers for this shift
  const matchingWorkers = tempWorkers.map((worker) => {
    const conflict = checkWorkerConflict(
      worker.id,
      currentShift.date,
      currentShift.startTime,
      currentShift.endTime,
      currentShift.id
    );

    const isAssigned = currentShift.assignedStaff.some(
      (s) => s.workerId === worker.id && s.status === 'confirmed'
    );

    // Location matching
    const stallLoc = stall?.location.toLowerCase() || '';
    const locMatch = worker.preferredLocations.some((l) =>
      stallLoc.includes(l.toLowerCase())
    );

    // Skills match
    const skillMatch = worker.skills.some((s) =>
      s.toLowerCase().includes(currentShift.taskTitle.toLowerCase())
    );

    let score = 55;
    if (skillMatch) score += 25;
    if (locMatch) score += 20;
    if (worker.hasFoodHygieneCert) score += 10;
    if (conflict.hasConflict) score = 0;

    return {
      worker,
      score: Math.min(score, 100),
      hasConflict: conflict.hasConflict,
      conflictingShift: conflict.conflictingShift,
      isAssigned,
      locMatch,
      skillMatch,
    };
  });

  // Find existing hiring request linked to this shift
  const linkedRequest = hiringRequests.find(
    (r) => r.linkedShiftId === currentShift.id
  );

  const handleDispatchToWorker = (worker: TempWorker) => {
    let reqId = linkedRequest?.id;

    if (!reqId) {
      // Create emergency hiring request linked to this shift
      reqId = createHiringRequest({
        companyId: currentShift.companyId,
        stallId: currentShift.stallId,
        jobRole: currentShift.taskTitle,
        description: `EMERGENCY DISPATCH: Urgent staff needed for ${currentShift.taskTitle} on ${currentShift.date} (${currentShift.startTime}–${currentShift.endTime}) at ${stall?.name}.`,
        startDate: currentShift.date,
        endDate: currentShift.date,
        applicableDays: ['Thu'],
        startTime: currentShift.startTime,
        endTime: currentShift.endTime,
        breakMinutes: currentShift.breakMinutes,
        requiredHeadcount: Math.max(shortage, 1),
        hourlySalary: currentShift.hourlyRate,
        requirements: ['WSQ Food Safety Cert', 'Available immediately'],
        isUrgent: true,
        status: 'pending_acceptance',
        linkedShiftId: currentShift.id,
        appliedWorkerIds: [worker.id],
        acceptedWorkerIds: [],
        declinedWorkerIds: [],
      });
    } else {
      sendRequestToWorker(reqId, worker.id);
    }
  };

  const handleSimulateAccept = (workerId: string) => {
    if (linkedRequest) {
      acceptJobOffer(linkedRequest.id, workerId);
    } else {
      // Create request and accept immediately
      const reqId = createHiringRequest({
        companyId: currentShift.companyId,
        stallId: currentShift.stallId,
        jobRole: currentShift.taskTitle,
        description: `Emergency replacement for ${currentShift.taskTitle}`,
        startDate: currentShift.date,
        endDate: currentShift.date,
        startTime: currentShift.startTime,
        endTime: currentShift.endTime,
        breakMinutes: currentShift.breakMinutes,
        requiredHeadcount: shortage,
        hourlySalary: currentShift.hourlyRate,
        requirements: ['Food Hygiene'],
        isUrgent: true,
        status: 'open',
        linkedShiftId: currentShift.id,
        appliedWorkerIds: [workerId],
        acceptedWorkerIds: [],
        declinedWorkerIds: [],
      });
      acceptJobOffer(reqId, workerId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-900 to-slate-900 text-white p-6 rounded-2xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white shadow-xs">
                <Zap className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Emergency Replacement System</h1>
              <span className="text-[10px] bg-rose-500/30 text-rose-200 border border-rose-400/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Instant Dispatch
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              When an employee takes sudden Medical Leave (MC) or fails to show up, report the absence,
              recalculate the manpower gap, and instantly dispatch replacement requests to verified nearby Singapore gig workers.
            </p>
          </div>

          <div className="text-right shrink-0 bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
            <p className="text-[11px] text-slate-300">Shifts with Shortages</p>
            <p className="text-2xl font-bold font-mono text-rose-300">{targetShifts.length}</p>
          </div>
        </div>
      </div>

      {/* Select Affected Shift */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Step 1: Select Affected Shift</h2>
            <p className="text-xs text-slate-500">Pick the shift experiencing manpower shortage or MC</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedShiftId}
              onChange={(e) => setSelectedShiftId(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
            >
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.taskTitle} · {s.date} ({s.startTime}–{s.endTime})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Shift Details Card */}
        {currentShift && (
          <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{currentShift.taskTitle}</h3>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      color === 'emerald'
                        ? 'bg-emerald-100 text-emerald-800'
                        : color === 'amber'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                  <span>{stall?.name} ({stall?.location})</span>
                  <span>·</span>
                  <span className="font-mono">{currentShift.date} · {currentShift.startTime}–{currentShift.endTime}</span>
                  <span>·</span>
                  <span>Offer Rate: S${currentShift.hourlyRate}/hr</span>
                </div>
              </div>

              {/* Headcount Stat */}
              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shrink-0">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block">Required</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {currentShift.requiredHeadcount}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block">Confirmed</span>
                  <span className="text-base font-bold text-emerald-600 font-mono">
                    {confirmedCount}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block">Shortage</span>
                  <span
                    className={`text-base font-bold font-mono ${
                      shortage > 0 ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  >
                    {shortage}
                  </span>
                </div>
              </div>
            </div>

            {/* Currently Confirmed Staff & Action to Mark MC */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-700 mb-2">
                Step 2: Mark Employee Absent (if reporting MC or emergency):
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {currentShift.assignedStaff.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No staff assigned yet</span>
                ) : (
                  currentShift.assignedStaff.map((staff) => (
                    <div
                      key={staff.workerId}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
                        staff.status === 'confirmed'
                          ? 'bg-white border-slate-200 text-slate-800'
                          : 'bg-rose-50 border-rose-200 text-rose-700 line-through'
                      }`}
                    >
                      <span className="font-semibold">{staff.workerName}</span>
                      <span className="text-[10px] text-slate-400">({staff.workerType})</span>

                      {staff.status === 'confirmed' ? (
                        <button
                          onClick={() => {
                            const reason = prompt(
                              `Enter absence reason for ${staff.workerName}:`,
                              'Medical Certificate (MC) - Unfit for duty'
                            );
                            if (reason !== null) {
                              reportAbsence(currentShift.id, staff.workerId, reason);
                            }
                          }}
                          className="text-[10px] bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold px-2 py-0.5 rounded ml-1 transition-colors"
                          title="Mark this employee absent to trigger emergency replacement"
                        >
                          Report MC / Absent
                        </button>
                      ) : (
                        <span className="text-[10px] text-rose-600 font-bold no-underline ml-1">
                          [Reported Absent]
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Available Matching Temporary Workers */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Step 3: Available Temporary Workers ({matchingWorkers.length})
            </h2>
            <p className="text-xs text-slate-500">
              Ranked by Singapore location proximity, food hygiene certificate, and availability
            </p>
          </div>

          {shortage === 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>Shift is Fully Staffed!</span>
            </div>
          ) : (
            <div className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{shortage} Worker(s) Urgently Needed</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matchingWorkers.map(({ worker, score, hasConflict, conflictingShift, isAssigned, locMatch }) => {
            const isInvited = linkedRequest?.appliedWorkerIds.includes(worker.id);

            return (
              <div
                key={worker.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isAssigned
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : hasConflict
                    ? 'border-slate-200 bg-slate-50/50 opacity-60'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">{worker.name}</span>
                        {worker.hasFoodHygieneCert && (
                          <span title="WSQ Food Safety Certified">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{worker.phone}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-slate-900">
                        S${worker.preferredHourlyRate}/hr
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-amber-600 justify-end">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{worker.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Compatibility Pill */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-500 font-medium">Match:</span>
                    <span
                      className={`font-bold font-mono ${
                        score >= 80 ? 'text-emerald-600' : 'text-blue-600'
                      }`}
                    >
                      {score}% Compatible
                    </span>
                  </div>

                  {/* Proximity / Locations */}
                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{worker.preferredLocations.join(', ')}</span>
                      {locMatch && (
                        <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 rounded font-semibold">
                          Nearby
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Conflict Notice */}
                  {hasConflict && (
                    <p className="mt-2 text-[10px] text-rose-600 font-medium bg-rose-50 p-1.5 rounded">
                      Unavailable: Already booked for {conflictingShift?.taskTitle}.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isAssigned ? (
                    <div className="w-full py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold text-center">
                      ✓ Confirmed on Shift
                    </div>
                  ) : isInvited ? (
                    <div className="w-full flex items-center justify-between gap-1.5">
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        Dispatched
                      </span>
                      <button
                        onClick={() => handleSimulateAccept(worker.id)}
                        className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                        title="Simulate this worker accepting immediately for the demo"
                      >
                        Accept Offer
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled={hasConflict}
                      onClick={() => handleDispatchToWorker(worker)}
                      className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
                        hasConflict
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Request</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
