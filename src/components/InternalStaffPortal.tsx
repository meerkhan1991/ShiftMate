import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  FileText,
  UserCheck,
  Send,
} from 'lucide-react';

export const InternalStaffPortal: React.FC = () => {
  const {
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    shifts,
    stalls,
    reportAbsence,
    updateEmployee,
  } = useApp();

  const currentEmp =
    employees.find((e) => e.id === selectedEmployeeId) || employees[0];

  const [absenceModalShiftId, setAbsenceModalShiftId] = useState<string | null>(null);
  const [mcReason, setMcReason] = useState('Medical Certificate (MC) - Fever & Respiratory infection');
  const [availabilityNotes, setAvailabilityNotes] = useState(currentEmp.availabilityNotes || '');

  // Shifts where this employee is assigned
  const myAssignedShifts = shifts.filter((s) =>
    s.assignedStaff.some((staff) => staff.workerId === currentEmp.id)
  );

  const handleReportMc = (e: React.FormEvent) => {
    e.preventDefault();
    if (absenceModalShiftId) {
      reportAbsence(absenceModalShiftId, currentEmp.id, mcReason);
      setAbsenceModalShiftId(null);
    }
  };

  const handleSaveAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployee({
      ...currentEmp,
      availabilityNotes,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {currentEmp.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{currentEmp.name}</h1>
              <span className="text-xs bg-indigo-50 text-indigo-800 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200">
                In-House {currentEmp.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentEmp.employmentType} · S${currentEmp.hourlyRate}/hr · {currentEmp.phone}
            </p>
          </div>
        </div>

        {/* Employee Switcher for testing */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Switch Employee:</span>
          <select
            value={currentEmp.id}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Assigned Shifts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">My Scheduled Shifts</h2>
            <p className="text-xs text-slate-500 mb-4">
              Your confirmed roster duties. If you fall ill, report MC here to alert operations.
            </p>

            <div className="space-y-3">
              {myAssignedShifts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No shifts assigned yet.
                </div>
              ) : (
                myAssignedShifts.map((shift) => {
                  const stall = stalls.find((s) => s.id === shift.stallId);
                  const staffRecord = shift.assignedStaff.find(
                    (s) => s.workerId === currentEmp.id
                  );
                  const isAbsent = staffRecord?.status === 'reported_absent';

                  return (
                    <div
                      key={shift.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isAbsent
                          ? 'border-rose-200 bg-rose-50/50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900">
                              {shift.taskTitle}
                            </h3>
                            {isAbsent ? (
                              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                                Absence / MC Reported
                              </span>
                            ) : (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                                Confirmed Duty
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{stall?.name}</p>
                          <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-1.5 font-mono">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{shift.date}</span>
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {shift.startTime} – {shift.endTime} (24h)
                              </span>
                            </span>
                          </div>
                        </div>

                        <div>
                          {!isAbsent ? (
                            <button
                              onClick={() => setAbsenceModalShiftId(shift.id)}
                              className="px-3 py-1.5 rounded-lg border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Report MC / Unfit</span>
                            </button>
                          ) : (
                            <span className="text-xs text-rose-600 font-medium">
                              Reason: {staffRecord?.absenceReason}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Availability Notes */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Update Working Availability</h2>
            <p className="text-xs text-slate-500 mb-4">
              Inform your manager about preferred days and shift hours
            </p>

            <form onSubmit={handleSaveAvailability} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Availability Preferences & Constraints
                </label>
                <textarea
                  rows={3}
                  value={availabilityNotes}
                  onChange={(e) => setAvailabilityNotes(e.target.value)}
                  placeholder="e.g. Available weekday mornings, examinations on Thursday..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
              >
                Save Availability Notes
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Report MC Modal */}
      {absenceModalShiftId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Report Absence / Medical Certificate (MC)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Submitting this will mark your shift as absent and trigger ShiftMate's Emergency Replacement system to backfill your position.
            </p>

            <form onSubmit={handleReportMc} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Absence Reason</label>
                <select
                  value={mcReason}
                  onChange={(e) => setMcReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                >
                  <option value="Medical Certificate (MC) - Fever & Respiratory infection">
                    Medical Certificate (MC) - Fever & Flu
                  </option>
                  <option value="Medical Certificate (MC) - Stomach Flu / Gastroenteritis">
                    Medical Certificate (MC) - Stomach Flu
                  </option>
                  <option value="Family Emergency / Urgent Personal Matter">
                    Family Emergency / Urgent Personal Matter
                  </option>
                  <option value="Hospitalization / Medical Treatment">
                    Hospitalization / Medical Treatment
                  </option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAbsenceModalShiftId(null)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Confirm Absence Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
