import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck,
  UserPlus,
  Zap,
  Repeat,
  X,
  Building2,
  MapPin,
  CalendarDays,
} from 'lucide-react';
import { Shift, Employee, TempWorker } from '../types';

export const StaffScheduling: React.FC = () => {
  const {
    shifts,
    addShift,
    updateShift,
    deleteShift,
    stalls,
    selectedStallId,
    setSelectedStallId,
    currentDate,
    setCurrentDate,
    employees,
    tempWorkers,
    assignWorkerToShift,
    removeWorkerFromShift,
    getShiftStaffingStatus,
    setCurrentView,
  } = useApp();

  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Shift Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [shiftForm, setShiftForm] = useState({
    stallId: selectedStallId,
    taskTitle: '',
    description: '',
    date: currentDate,
    startTime: '09:00',
    endTime: '17:00',
    breakMinutes: 45,
    requiredHeadcount: 2,
    hourlyRate: 13,
    notes: '',
    isRecurring: false,
    recurrencePattern: 'daily' as Shift['recurrencePattern'],
  });

  // Assign Worker Modal State
  const [assignModalShift, setAssignModalShift] = useState<Shift | null>(null);

  // Active Stall
  const activeStall = stalls.find((s) => s.id === selectedStallId) || stalls[0];

  // Filter shifts by stall
  const stallShifts = shifts.filter((s) => s.stallId === selectedStallId);

  // Helper for Date Math
  const changeDateByDays = (delta: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + delta);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  // Open Add/Edit Modal
  const handleOpenShiftModal = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift);
      setShiftForm({
        stallId: shift.stallId,
        taskTitle: shift.taskTitle,
        description: shift.description,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        breakMinutes: shift.breakMinutes,
        requiredHeadcount: shift.requiredHeadcount,
        hourlyRate: shift.hourlyRate,
        notes: shift.notes || '',
        isRecurring: shift.isRecurring || false,
        recurrencePattern: shift.recurrencePattern || 'daily',
      });
    } else {
      setEditingShift(null);
      setShiftForm({
        stallId: selectedStallId,
        taskTitle: 'Service Crew',
        description: 'Customer service, cashiering, and table order attendance.',
        date: currentDate,
        startTime: '10:00',
        endTime: '18:00',
        breakMinutes: 45,
        requiredHeadcount: 2,
        hourlyRate: 13,
        notes: '',
        isRecurring: false,
        recurrencePattern: 'daily',
      });
    }
    setModalOpen(true);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftForm.taskTitle || !shiftForm.date) return;

    if (editingShift) {
      updateShift({
        ...editingShift,
        ...shiftForm,
      });
    } else {
      // Add initial shift
      addShift({
        companyId: activeStall.companyId,
        stallId: shiftForm.stallId,
        taskTitle: shiftForm.taskTitle,
        description: shiftForm.description,
        date: shiftForm.date,
        startTime: shiftForm.startTime,
        endTime: shiftForm.endTime,
        breakMinutes: Number(shiftForm.breakMinutes),
        requiredHeadcount: Number(shiftForm.requiredHeadcount),
        assignedStaff: [],
        hourlyRate: Number(shiftForm.hourlyRate),
        notes: shiftForm.notes,
        isRecurring: shiftForm.isRecurring,
        recurrencePattern: shiftForm.recurrencePattern,
      });

      // Handle recurrence generation if enabled
      if (shiftForm.isRecurring) {
        const baseDate = new Date(shiftForm.date);
        const recurringDays = shiftForm.recurrencePattern === 'daily' ? 3 : 2;
        for (let i = 1; i <= recurringDays; i++) {
          const nextDate = new Date(baseDate);
          nextDate.setDate(baseDate.getDate() + i);
          const dateStr = nextDate.toISOString().split('T')[0];

          addShift({
            companyId: activeStall.companyId,
            stallId: shiftForm.stallId,
            taskTitle: `${shiftForm.taskTitle} (Recurring)`,
            description: shiftForm.description,
            date: dateStr,
            startTime: shiftForm.startTime,
            endTime: shiftForm.endTime,
            breakMinutes: Number(shiftForm.breakMinutes),
            requiredHeadcount: Number(shiftForm.requiredHeadcount),
            assignedStaff: [],
            hourlyRate: Number(shiftForm.hourlyRate),
            notes: shiftForm.notes,
            isRecurring: true,
            recurrencePattern: shiftForm.recurrencePattern,
          });
        }
      }
    }
    setModalOpen(false);
  };

  // Get days for weekly view around currentDate
  const getWeekDates = () => {
    const curr = new Date(currentDate);
    const day = curr.getDay(); // 0 is Sunday
    // adjust so Monday is first day
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diff));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      week.push(nextDay.toISOString().split('T')[0]);
    }
    return week;
  };

  const weekDates = getWeekDates();

  // Filter shifts based on viewMode
  const displayedShifts =
    viewMode === 'daily'
      ? stallShifts.filter((s) => s.date === currentDate)
      : viewMode === 'weekly'
      ? stallShifts.filter((s) => weekDates.includes(s.date))
      : stallShifts; // monthly / all

  return (
    <div className="space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Staff Scheduling & Roster</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize shifts, assign internal and temporary staff, and detect headcount shortages
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Stall Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedStallId}
              onChange={(e) => setSelectedStallId(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              {stalls.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Segmented Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'daily' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'weekly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Shifts
            </button>
          </div>

          <button
            onClick={() => handleOpenShiftModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Shift</span>
          </button>
        </div>
      </div>

      {/* Date Navigator Bar */}
      <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDateByDays(-1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => changeDateByDays(1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-slate-900 ml-2">
            {new Date(currentDate).toLocaleDateString('en-SG', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate('2026-10-15')}
            className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg hover:bg-teal-100 transition-colors"
          >
            Jump to Demo Day (15 Oct 2026)
          </button>
        </div>
      </div>

      {/* Color Status Legend */}
      <div className="flex flex-wrap items-center gap-4 px-1 text-xs text-slate-600">
        <span className="font-semibold text-slate-700">Staffing Status Indicators:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="font-medium text-emerald-800">Green: Fully Staffed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="font-medium text-amber-800">Orange: Partially Staffed (Shortage)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="font-medium text-rose-800">Red: No Staff Assigned</span>
        </div>
      </div>

      {/* Weekly View Columns */}
      {viewMode === 'weekly' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDates.map((dateStr) => {
            const dayShifts = stallShifts.filter((s) => s.date === dateStr);
            const isToday = dateStr === currentDate;
            const dateObj = new Date(dateStr);

            return (
              <div
                key={dateStr}
                onClick={() => {
                  setCurrentDate(dateStr);
                  setViewMode('daily');
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer bg-white ${
                  isToday
                    ? 'border-blue-500 ring-2 ring-blue-500/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-center pb-2 border-b border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500">
                    {dateObj.toLocaleDateString('en-SG', { weekday: 'short' })}
                  </p>
                  <p className="text-sm font-bold text-slate-900">{dateObj.getDate()}</p>
                </div>

                <div className="mt-2 space-y-1.5 min-h-[120px]">
                  {dayShifts.length === 0 ? (
                    <p className="text-[10px] text-slate-400 text-center pt-6">No shifts</p>
                  ) : (
                    dayShifts.map((s) => {
                      const { color, confirmedCount, shortage } = getShiftStaffingStatus(s);
                      const bg =
                        color === 'emerald'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : color === 'amber'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200';

                      return (
                        <div
                          key={s.id}
                          className={`p-1.5 rounded-lg border text-[10px] font-medium ${bg}`}
                        >
                          <p className="font-bold truncate">{s.taskTitle}</p>
                          <p className="font-mono text-[9px]">
                            {s.startTime}–{s.endTime}
                          </p>
                          <p className="mt-0.5 font-bold">
                            {confirmedCount}/{s.requiredHeadcount} staff
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Shift Cards List (Daily or Monthly view) */}
      <div className="space-y-4">
        {displayedShifts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
            <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No shifts scheduled</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no tasks or shifts planned for this date. Click "Create Shift" above to add your first shift.
            </p>
            <button
              onClick={() => handleOpenShiftModal()}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs"
            >
              Create Shift
            </button>
          </div>
        ) : (
          displayedShifts.map((shift) => {
            const { status, confirmedCount, shortage, color, label } = getShiftStaffingStatus(shift);
            const confirmedStaff = shift.assignedStaff.filter((s) => s.status === 'confirmed');
            const absentStaff = shift.assignedStaff.filter((s) => s.status === 'reported_absent');

            // Border color coding
            const cardBorder =
              color === 'emerald'
                ? 'border-emerald-300 ring-1 ring-emerald-500/10'
                : color === 'amber'
                ? 'border-amber-300 ring-1 ring-amber-500/10'
                : 'border-rose-300 ring-1 ring-rose-500/10';

            const badgeStyle =
              color === 'emerald'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : color === 'amber'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200';

            return (
              <div
                key={shift.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${cardBorder}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Task Title, Date, Timing */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-slate-900">{shift.taskTitle}</h3>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${badgeStyle}`}>
                        {label}
                      </span>
                      {shift.isRecurring && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                          <Repeat className="w-3 h-3" />
                          <span>Recurring</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {shift.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{shift.date}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {shift.startTime} – {shift.endTime} (24h)
                        </span>
                      </span>
                      <span>·</span>
                      <span>Break: {shift.breakMinutes} mins</span>
                      <span>·</span>
                      <span>Rate: S${shift.hourlyRate}/hr</span>
                    </div>
                  </div>

                  {/* Right: Headcount Calculation & Quick Actions */}
                  <div className="flex flex-wrap items-center gap-3 lg:self-center">
                    {/* Headcount math box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-right">
                      <div className="text-xs font-bold text-slate-900 font-mono">
                        {confirmedCount} / {shift.requiredHeadcount} Staff Assigned
                      </div>
                      <div className="text-[11px] font-semibold mt-0.5">
                        {shortage > 0 ? (
                          <span className="text-rose-600">Shortage = {shortage} Staff</span>
                        ) : (
                          <span className="text-emerald-600">Target Reached</span>
                        )}
                      </div>
                    </div>

                    {/* Assign Staff Button */}
                    <button
                      onClick={() => setAssignModalShift(shift)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-xs transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                      <span>Assign Staff</span>
                    </button>

                    {/* Find Replacement Button if there is Shortage */}
                    {shortage > 0 && (
                      <button
                        onClick={() => setCurrentView('emergency_replacement')}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Find Replacement</span>
                      </button>
                    )}

                    {/* Edit & Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenShiftModal(shift)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit Shift"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Cancel and delete shift "${shift.taskTitle}"?`)) {
                            deleteShift(shift.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Cancel Shift"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Assigned Staff Grid */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-700">Roster Staff:</span>
                    <span className="text-slate-500 text-[11px]">
                      Permanent employees and confirmed temporary workers
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {shift.assignedStaff.length === 0 ? (
                      <span className="text-xs text-rose-600 font-medium bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                        No staff assigned yet. Click "Assign Staff" or "Find Replacement".
                      </span>
                    ) : (
                      shift.assignedStaff.map((staff) => (
                        <div
                          key={staff.workerId}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
                            staff.status === 'confirmed'
                              ? staff.workerType === 'temporary'
                                ? 'bg-teal-50 border-teal-200 text-teal-900 font-medium'
                                : 'bg-slate-50 border-slate-200 text-slate-800 font-medium'
                              : 'bg-rose-50 border-rose-200 text-rose-700 line-through opacity-75'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              staff.status === 'confirmed'
                                ? staff.workerType === 'temporary'
                                  ? 'bg-teal-500'
                                  : 'bg-blue-600'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span>{staff.workerName}</span>
                          <span className="text-[10px] text-slate-500">
                            ({staff.workerType === 'temporary' ? 'Temp Hire' : 'In-House'} · S$
                            {staff.hourlyRate}/hr)
                          </span>
                          {staff.status === 'reported_absent' && (
                            <span className="text-[10px] text-rose-600 font-bold no-underline">
                              [MC: {staff.absenceReason}]
                            </span>
                          )}
                          <button
                            onClick={() => removeWorkerFromShift(shift.id, staff.workerId)}
                            className="text-slate-400 hover:text-rose-600 ml-1"
                            title="Remove from shift"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create / Edit Shift */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingShift ? 'Edit Shift Task' : 'Create New Shift Task'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Task / Role Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Service Crew, Cashier, Kitchen Helper"
                  value={shiftForm.taskTitle}
                  onChange={(e) => setShiftForm({ ...shiftForm, taskTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Description</label>
                <textarea
                  rows={2}
                  placeholder="Specific shift duties, station requirements, uniform..."
                  value={shiftForm.description}
                  onChange={(e) => setShiftForm({ ...shiftForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shift Date</label>
                  <input
                    type="date"
                    required
                    value={shiftForm.date}
                    onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stall / Outlet</label>
                  <select
                    value={shiftForm.stallId}
                    onChange={(e) => setShiftForm({ ...shiftForm, stallId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {stalls.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={shiftForm.startTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={shiftForm.endTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unpaid Break (mins)</label>
                  <input
                    type="number"
                    min={0}
                    step={15}
                    value={shiftForm.breakMinutes}
                    onChange={(e) =>
                      setShiftForm({ ...shiftForm, breakMinutes: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Required Headcount <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={shiftForm.requiredHeadcount}
                    onChange={(e) =>
                      setShiftForm({ ...shiftForm, requiredHeadcount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hourly Rate (SGD S$)</label>
                  <input
                    type="number"
                    min={10}
                    max={50}
                    required
                    value={shiftForm.hourlyRate}
                    onChange={(e) =>
                      setShiftForm({ ...shiftForm, hourlyRate: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Recurring Shift options */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold text-slate-700">Recurring Shift</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={shiftForm.isRecurring}
                    onChange={(e) => setShiftForm({ ...shiftForm, isRecurring: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </div>

                {shiftForm.isRecurring && (
                  <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-3">
                    <span className="text-slate-500">Recurrence Pattern:</span>
                    <select
                      value={shiftForm.recurrencePattern}
                      onChange={(e) =>
                        setShiftForm({
                          ...shiftForm,
                          recurrencePattern: e.target.value as Shift['recurrencePattern'],
                        })
                      }
                      className="px-2 py-1 rounded border border-slate-200 bg-white"
                    >
                      <option value="daily">Daily (Next 3 Days)</option>
                      <option value="weekdays">Weekdays</option>
                      <option value="weekends">Weekends</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  {editingShift ? 'Save Changes' : 'Schedule Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Staff (Preventing Overlaps) */}
      {assignModalShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Assign Staff to {assignModalShift.taskTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  {assignModalShift.date} · {assignModalShift.startTime}–{assignModalShift.endTime} (24h)
                </p>
              </div>
              <button
                onClick={() => setAssignModalShift(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs max-h-[420px] overflow-y-auto">
              {/* Internal Employees List */}
              <div>
                <p className="font-bold text-slate-800 mb-2">Internal Stall Employees:</p>
                <div className="space-y-2">
                  {employees.map((emp) => {
                    const isAssigned = assignModalShift.assignedStaff.some(
                      (s) => s.workerId === emp.id && s.status === 'confirmed'
                    );

                    return (
                      <div
                        key={emp.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{emp.name}</span>
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                              {emp.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {emp.employmentType} · S${emp.hourlyRate}/hr · {emp.availabilityNotes || 'Available'}
                          </p>
                        </div>

                        <div>
                          {isAssigned ? (
                            <button
                              onClick={() => removeWorkerFromShift(assignModalShift.id, emp.id)}
                              className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const res = assignWorkerToShift(
                                  assignModalShift.id,
                                  emp.id,
                                  'permanent',
                                  emp.hourlyRate
                                );
                                if (res.success) setAssignModalShift(null);
                              }}
                              className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                            >
                              Assign
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Verified Temporary Workers Pool */}
              <div className="pt-3 border-t border-slate-200">
                <p className="font-bold text-teal-800 mb-2">Verified Temporary Workers Pool:</p>
                <div className="space-y-2">
                  {tempWorkers.map((worker) => {
                    const isAssigned = assignModalShift.assignedStaff.some(
                      (s) => s.workerId === worker.id && s.status === 'confirmed'
                    );

                    return (
                      <div
                        key={worker.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-teal-100 bg-teal-50/40 hover:bg-teal-50/80"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{worker.name}</span>
                            <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-medium">
                              ★ {worker.rating}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Prefers {worker.preferredLocations[0]} · S${worker.preferredHourlyRate}/hr · {worker.skills.slice(0, 2).join(', ')}
                          </p>
                        </div>

                        <div>
                          {isAssigned ? (
                            <button
                              onClick={() => removeWorkerFromShift(assignModalShift.id, worker.id)}
                              className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const res = assignWorkerToShift(
                                  assignModalShift.id,
                                  worker.id,
                                  'temporary',
                                  worker.preferredHourlyRate
                                );
                                if (res.success) setAssignModalShift(null);
                              }}
                              className="px-3 py-1 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
                            >
                              Assign Temp
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setAssignModalShift(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
