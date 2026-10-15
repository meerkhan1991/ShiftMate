import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  UserPlus,
  Calendar,
  Clock,
  DollarSign,
  AlertTriangle,
  Send,
  CheckCircle,
  Building2,
  MapPin,
  Sparkles,
  Filter,
  Check,
  Star,
  Users,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { TempWorker, HiringRequest } from '../types';

export const TempStaffHiring: React.FC = () => {
  const {
    stalls,
    selectedStallId,
    setSelectedStallId,
    tempWorkers,
    hiringRequests,
    createHiringRequest,
    sendRequestToWorker,
    shifts,
    checkWorkerConflict,
    setCurrentView,
    setSelectedTempWorkerId,
    setCurrentRole,
  } = useApp();

  const activeStall = stalls.find((s) => s.id === selectedStallId) || stalls[0];

  // Form State
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Thu', 'Fri']);
  const [form, setForm] = useState({
    stallId: selectedStallId,
    jobRole: 'Service Crew',
    description: 'Provide dining room service, drink order preparation, and POS cashiering during peak meal hours.',
    startDate: '2026-10-15',
    endDate: '2026-10-15',
    startTime: '12:00',
    endTime: '20:00',
    breakMinutes: 45,
    requiredHeadcount: 2,
    hourlySalary: 13,
    requirements: ['Valid WSQ Food Safety Cert', 'Fluent in English', 'Punctual & attentive'],
    isUrgent: true,
  });

  const [activeTab, setActiveTab] = useState<'create' | 'requests' | 'candidates'>('create');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Calculate shift duration and cost
  const [startH, startM] = form.startTime.split(':').map(Number);
  const [endH, endM] = form.endTime.split(':').map(Number);
  const rawDurationHours = Math.max((endH * 60 + endM - (startH * 60 + startM) - form.breakMinutes) / 60, 0);

  // Count days
  const daysCount = isMultiDay ? Math.max(selectedDays.length, 1) : 1;
  const estimatedLabourCost = form.requiredHeadcount * form.hourlySalary * rawDurationHours * daysCount;
  const platformFee = estimatedLabourCost * 0.05; // 5% matching fee
  const totalEstimatedCost = estimatedLabourCost + platformFee;

  const handleToggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const reqId = createHiringRequest({
      companyId: activeStall.companyId,
      stallId: form.stallId,
      jobRole: form.jobRole,
      description: form.description,
      startDate: form.startDate,
      endDate: isMultiDay ? form.endDate : form.startDate,
      applicableDays: isMultiDay ? selectedDays : ['Thu'],
      startTime: form.startTime,
      endTime: form.endTime,
      breakMinutes: Number(form.breakMinutes),
      requiredHeadcount: Number(form.requiredHeadcount),
      hourlySalary: Number(form.hourlySalary),
      requirements: form.requirements,
      isUrgent: form.isUrgent,
      status: 'open',
      appliedWorkerIds: [],
      acceptedWorkerIds: [],
      declinedWorkerIds: [],
    });

    setSelectedRequestId(reqId);
    setActiveTab('candidates');
  };

  // Find suitable candidates based on role, location, hourly rate, and conflict status
  const getCandidateSuitability = (worker: TempWorker) => {
    const skillsMatch = worker.skills.some((s) =>
      s.toLowerCase().includes(form.jobRole.toLowerCase())
    );
    const locationMatch = worker.preferredLocations.some(
      (loc) =>
        activeStall.location.toLowerCase().includes(loc.toLowerCase()) ||
        activeStall.area.toLowerCase() === loc.toLowerCase()
    );
    const rateMatch = worker.preferredHourlyRate <= form.hourlySalary + 1;

    // Check conflict
    const conflict = checkWorkerConflict(
      worker.id,
      form.startDate,
      form.startTime,
      form.endTime
    );

    let score = 50;
    if (skillsMatch) score += 25;
    if (locationMatch) score += 20;
    if (rateMatch) score += 15;
    if (worker.hasFoodHygieneCert) score += 10;
    if (conflict.hasConflict) score = 0;

    return {
      score: Math.min(score, 100),
      skillsMatch,
      locationMatch,
      rateMatch,
      hasConflict: conflict.hasConflict,
      conflictingShift: conflict.conflictingShift,
    };
  };

  // Active target request for invitations
  const activeRequest =
    hiringRequests.find((r) => r.id === selectedRequestId) || hiringRequests[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Temporary Staff Hiring</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch urgent or scheduled hiring requests to verified casual & contract F&B workers across Singapore
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'create' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Request
          </button>
          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'candidates' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matching Workers
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'requests' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Requests ({hiringRequests.length})
          </button>
        </div>
      </div>

      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Post New Temporary Hiring Request</h2>
            <p className="text-xs text-slate-500 mb-5">
              Specify timing, headcount, requirements, and competitive hourly wage (SGD)
            </p>

            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Stall</label>
                  <select
                    value={form.stallId}
                    onChange={(e) => setForm({ ...form, stallId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {stalls.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Role / Task</label>
                  <select
                    value={form.jobRole}
                    onChange={(e) => setForm({ ...form, jobRole: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Service Crew">Service Crew</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Kitchen Helper">Kitchen Helper</option>
                    <option value="Food Prep / Assistant Cook">Food Prep / Assistant Cook</option>
                    <option value="Dishwasher & Steward">Dishwasher & Steward</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Description & Duties</label>
                <textarea
                  rows={2}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Single Day vs Multi-day Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700">Hiring Duration Mode</span>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsMultiDay(false)}
                      className={`px-2.5 py-1 rounded-md font-medium ${
                        !isMultiDay ? 'bg-white text-blue-700 shadow-xs border border-slate-200' : 'text-slate-500'
                      }`}
                    >
                      Single Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMultiDay(true)}
                      className={`px-2.5 py-1 rounded-md font-medium ${
                        isMultiDay ? 'bg-white text-blue-700 shadow-xs border border-slate-200' : 'text-slate-500'
                      }`}
                    >
                      Multi-Day
                    </button>
                  </div>
                </div>

                {isMultiDay ? (
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={form.startDate}
                          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">End Date</label>
                        <input
                          type="date"
                          value={form.endDate}
                          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Applicable Working Days:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleToggleDay(day)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                              selectedDays.includes(day)
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Shift Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full px-3 py-1.5 rounded border border-slate-200 bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Working Hours & Headcount */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Daily Start (24h)</label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Daily End (24h)</label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Required Workers</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={form.requiredHeadcount}
                    onChange={(e) => setForm({ ...form, requiredHeadcount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hourly Salary (SGD)</label>
                  <input
                    type="number"
                    min={10}
                    max={40}
                    required
                    value={form.hourlySalary}
                    onChange={(e) => setForm({ ...form, hourlySalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              {/* Urgent Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-rose-200 bg-rose-50/60">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <div>
                    <p className="font-semibold text-rose-900">Urgent Request Flag</p>
                    <p className="text-[11px] text-rose-700">Pushes immediate high-priority alert to nearby workers</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.isUrgent}
                  onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Post Hiring Request & Find Workers</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right 1 Col: Live Estimated Labour Cost Summary (Module 3 requirement) */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-teal-600" />
                  <span>Estimated Labour Cost</span>
                </h3>
                <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-bold">
                  Live SGD
                </span>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Shift Duration:</span>
                  <span className="font-semibold text-slate-800">
                    {rawDurationHours.toFixed(1)} hrs / day
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Working Days:</span>
                  <span className="font-semibold text-slate-800">{daysCount} day(s)</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Headcount:</span>
                  <span className="font-semibold text-slate-800">{form.requiredHeadcount} worker(s)</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Hourly Rate:</span>
                  <span className="font-semibold text-slate-800">S${form.hourlySalary} / hr</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between text-slate-700">
                  <span>Gross Worker Payout:</span>
                  <span className="font-bold font-mono">S${estimatedLabourCost.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Platform Fee (5%):</span>
                  <span className="font-mono">S${platformFee.toFixed(2)}</span>
                </div>

                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 mt-2">
                  <div className="flex justify-between items-center text-teal-950 font-bold">
                    <span>Total Est. Budget:</span>
                    <span className="text-base font-mono">S${totalEstimatedCost.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-teal-700 mt-1">
                    Cost per worker: S${(totalEstimatedCost / form.requiredHeadcount).toFixed(2)}
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                *Labour cost calculations are estimates. Workers are paid upon shift completion and digital timesheet verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Matching Candidates */}
      {activeTab === 'candidates' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Matching Temporary Workers for {form.jobRole}
              </h2>
              <p className="text-xs text-slate-500">
                Filtered by Singapore location ({activeStall.location}), skills, rating, and schedule availability
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Target Request:</span>
              <select
                value={selectedRequestId || ''}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium"
              >
                {hiringRequests.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.jobRole} ({r.startDate} {r.startTime}–{r.endTime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Candidates Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tempWorkers.map((worker) => {
              const suitability = getCandidateSuitability(worker);
              const isInvited = activeRequest?.appliedWorkerIds.includes(worker.id);
              const isAccepted = activeRequest?.acceptedWorkerIds.includes(worker.id);

              return (
                <div
                  key={worker.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-slate-900">{worker.name}</h3>
                          {worker.hasFoodHygieneCert && (
                            <span title="Valid WSQ Food Safety Course Level 1">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{worker.phone}</p>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600 justify-end">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{worker.rating}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {worker.completedShiftsCount} shifts done
                        </p>
                      </div>
                    </div>

                    {/* Suitability score meter */}
                    <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Match Score:</span>
                      <span
                        className={`font-bold font-mono ${
                          suitability.score >= 80
                            ? 'text-emerald-600'
                            : suitability.score >= 50
                            ? 'text-blue-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {suitability.score}% Compatible
                      </span>
                    </div>

                    {/* Bio & Details */}
                    <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                      {worker.bio}
                    </p>

                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center justify-between">
                        <span>Preferred Area:</span>
                        <span className="font-medium text-slate-800">
                          {worker.preferredLocations.join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Rate Expectation:</span>
                        <span className="font-medium text-slate-800">
                          S${worker.preferredHourlyRate}/hr
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Available Days:</span>
                        <span className="font-medium text-slate-800">
                          {worker.availableDays.slice(0, 3).join(', ')}...
                        </span>
                      </div>
                    </div>

                    {/* Skills pills */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {worker.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Conflict notice if any */}
                    {suitability.hasConflict && (
                      <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700 font-medium">
                        Schedule Conflict: Already on duty for {suitability.conflictingShift?.taskTitle}.
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {isAccepted ? (
                      <div className="w-full py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200">
                        <CheckCircle className="w-4 h-4" />
                        <span>Shift Accepted & Confirmed</span>
                      </div>
                    ) : isInvited ? (
                      <div className="w-full flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 flex-1 text-center">
                          Awaiting Worker Acceptance
                        </span>
                        {/* Quick switch shortcut for classroom demonstration */}
                        <button
                          onClick={() => {
                            setSelectedTempWorkerId(worker.id);
                            setCurrentRole('temporary_worker');
                            setCurrentView('worker_portal');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold shrink-0"
                          title="Switch to this worker to accept offer in demo"
                        >
                          Simulate Accept
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={suitability.hasConflict || !activeRequest}
                        onClick={() => {
                          if (activeRequest) {
                            sendRequestToWorker(activeRequest.id, worker.id);
                          }
                        }}
                        className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
                          suitability.hasConflict
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Shift Offer (S${form.hourlySalary}/hr)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Active Requests List */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Active Temporary Staff Requests
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Real-time booking statuses: Open, Pending Acceptance, Partially Filled, Filled
            </p>

            <div className="divide-y divide-slate-100">
              {hiringRequests.map((req) => {
                const stall = stalls.find((s) => s.id === req.stallId);
                const acceptedWorkers = tempWorkers.filter((w) =>
                  req.acceptedWorkerIds.includes(w.id)
                );
                const invitedWorkers = tempWorkers.filter((w) =>
                  req.appliedWorkerIds.includes(w.id)
                );

                return (
                  <div key={req.id} className="py-4 space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{req.jobRole}</span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            req.status === 'filled'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'partially_filled'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {req.status === 'pending_acceptance' ? 'Pending Acceptance' : req.status}
                        </span>
                        {req.isUrgent && (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded uppercase">
                            Urgent
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-slate-800">
                          {req.acceptedWorkerIds.length} of {req.requiredHeadcount} Filled
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-600">{req.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
                      <span>{stall?.name}</span>
                      <span>·</span>
                      <span>
                        {req.startDate} {req.startDate !== req.endDate ? `to ${req.endDate}` : ''}
                      </span>
                      <span>·</span>
                      <span className="font-mono">
                        {req.startTime}–{req.endTime}
                      </span>
                      <span>·</span>
                      <span>Hourly: S${req.hourlySalary}/hr</span>
                    </div>

                    {/* Accepted & Invited workers lists */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-600">Confirmed Workers:</span>
                      {acceptedWorkers.length === 0 ? (
                        <span className="text-slate-400 italic">None yet</span>
                      ) : (
                        acceptedWorkers.map((w) => (
                          <span
                            key={w.id}
                            className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium"
                          >
                            ✓ {w.name}
                          </span>
                        ))
                      )}

                      <span className="font-semibold text-slate-600 ml-3">Pending Invitations:</span>
                      {invitedWorkers.length === 0 ? (
                        <span className="text-slate-400 italic">None</span>
                      ) : (
                        invitedWorkers.map((w) => (
                          <span
                            key={w.id}
                            className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                          >
                            {w.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
