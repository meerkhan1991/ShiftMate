import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Briefcase,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Star,
  Check,
  Building,
  User,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const WorkerPortal: React.FC = () => {
  const {
    tempWorkers,
    selectedTempWorkerId,
    setSelectedTempWorkerId,
    updateTempWorker,
    hiringRequests,
    shifts,
    acceptJobOffer,
    declineJobOffer,
    stalls,
    company,
  } = useApp();

  const currentWorker =
    tempWorkers.find((w) => w.id === selectedTempWorkerId) || tempWorkers[0];

  const [activeTab, setActiveTab] = useState<'offers' | 'confirmed' | 'profile' | 'marketplace'>('offers');
  const [profileForm, setProfileForm] = useState(currentWorker);

  // Offers sent to this worker
  const myOffers = hiringRequests.filter(
    (req) =>
      req.appliedWorkerIds.includes(currentWorker.id) &&
      !req.acceptedWorkerIds.includes(currentWorker.id) &&
      !req.declinedWorkerIds.includes(currentWorker.id)
  );

  // Confirmed assignments for this worker
  const myConfirmedRequests = hiringRequests.filter((req) =>
    req.acceptedWorkerIds.includes(currentWorker.id)
  );

  // Confirmed shifts from scheduler
  const myConfirmedShifts = shifts.filter((shift) =>
    shift.assignedStaff.some(
      (s) => s.workerId === currentWorker.id && s.status === 'confirmed'
    )
  );

  // Calculate estimated total earnings
  const totalEstimatedEarnings = myConfirmedShifts.reduce((total, shift) => {
    const [startH, startM] = shift.startTime.split(':').map(Number);
    const [endH, endM] = shift.endTime.split(':').map(Number);
    const hours = Math.max((endH * 60 + endM - (startH * 60 + startM) - shift.breakMinutes) / 60, 0);
    const staffRecord = shift.assignedStaff.find((s) => s.workerId === currentWorker.id);
    const rate = staffRecord?.hourlyRate || currentWorker.preferredHourlyRate;
    return total + hours * rate;
  }, 0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateTempWorker(profileForm);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Worker Persona Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {currentWorker.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{currentWorker.name}</h1>
              <span className="text-xs bg-teal-50 text-teal-800 font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
                Temporary Worker
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span>{currentWorker.phone}</span>
              <span>·</span>
              <span className="flex items-center gap-1 font-semibold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{currentWorker.rating} Rating</span>
              </span>
              <span>·</span>
              <span>{currentWorker.completedShiftsCount} Shifts Completed</span>
            </div>
          </div>
        </div>

        {/* Quick Worker Persona Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Switch Profile:</span>
          <select
            value={currentWorker.id}
            onChange={(e) => {
              const selected = tempWorkers.find((w) => w.id === e.target.value);
              if (selected) {
                setSelectedTempWorkerId(selected.id);
                setProfileForm(selected);
              }
            }}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none"
          >
            {tempWorkers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.preferredLocations[0]} · S${w.preferredHourlyRate}/hr)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('offers')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'offers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Shift Offers</span>
          {myOffers.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-teal-600 text-white text-[10px] font-bold">
              {myOffers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('confirmed')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'confirmed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Confirmed Shifts</span>
          <span className="text-[10px] font-mono text-slate-400">({myConfirmedShifts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'marketplace' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Browse All Gigs
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'profile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          My Profile & Skills
        </button>
      </div>

      {/* Tab: Shift Offers Received */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Shift Offers Awaiting Your Response ({myOffers.length})
            </h2>
            <span className="text-xs text-slate-500">
              Accept to instantly book your spot and update the stall roster
            </span>
          </div>

          {myOffers.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
              <CheckCircle className="w-10 h-10 text-teal-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">You're all caught up!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No pending job offers right now. You can browse all available gigs in the "Browse All Gigs" tab.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myOffers.map((offer) => {
                const stall = stalls.find((s) => s.id === offer.stallId);
                const [sH, sM] = offer.startTime.split(':').map(Number);
                const [eH, eM] = offer.endTime.split(':').map(Number);
                const hours = Math.max((eH * 60 + eM - (sH * 60 + sM) - offer.breakMinutes) / 60, 0);
                const estPay = hours * offer.hourlySalary;

                return (
                  <div
                    key={offer.id}
                    className="bg-white rounded-2xl border border-teal-200 p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900">{offer.jobRole}</h3>
                            {offer.isUrgent && (
                              <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded uppercase">
                                Urgent
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-teal-700 mt-0.5">
                            {company.name} · {stall?.name}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-base font-bold text-slate-900 font-mono">
                            S${offer.hourlySalary}/hr
                          </p>
                          <p className="text-[11px] text-teal-600 font-medium">Est. Pay: S${estPay.toFixed(0)}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                        {offer.description}
                      </p>

                      <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-800">{offer.startDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono text-slate-800">
                            {offer.startTime} – {offer.endTime} ({hours.toFixed(1)} hrs net)
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{stall?.location}</span>
                        </div>
                      </div>

                      {offer.requirements.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {offer.requirements.map((req, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded"
                            >
                              ✓ {req}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => declineJobOffer(offer.id, currentWorker.id, 'Schedule conflict')}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => acceptJobOffer(offer.id, currentWorker.id)}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Shift</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Confirmed Shifts & Earnings Tracker */}
      {activeTab === 'confirmed' && (
        <div className="space-y-6">
          {/* Earnings Widget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Confirmed Shifts</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{myConfirmedShifts.length}</p>
              <p className="text-[10px] text-slate-400 mt-1">Upcoming assignments</p>
            </div>

            <div className="p-4 rounded-2xl border border-teal-200 bg-teal-50/60 shadow-xs">
              <span className="text-[11px] font-semibold text-teal-800">Estimated Gross Earnings</span>
              <p className="text-2xl font-bold text-teal-900 mt-1 font-mono">
                S${totalEstimatedEarnings.toFixed(2)}
              </p>
              <p className="text-[10px] text-teal-700 mt-1">PayNow direct to {currentWorker.phone}</p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Next Payout Cycle</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">Weekly (Mon)</p>
              <p className="text-[10px] text-slate-400 mt-1">Automatic disbursement</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4">Confirmed Shift Schedule</h2>

            {myConfirmedShifts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No confirmed shifts yet. Review and accept offers in the Shift Offers tab.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {myConfirmedShifts.map((shift) => {
                  const stall = stalls.find((s) => s.id === shift.stallId);
                  const staffRecord = shift.assignedStaff.find((s) => s.workerId === currentWorker.id);

                  return (
                    <div key={shift.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{shift.taskTitle}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                            Confirmed
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">{stall?.name} · {stall?.location}</p>
                        <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-1 font-mono">
                          <span>{shift.date}</span>
                          <span>·</span>
                          <span>{shift.startTime} – {shift.endTime}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-slate-900 font-mono">
                          S${staffRecord?.hourlyRate || currentWorker.preferredHourlyRate}/hr
                        </p>
                        <p className="text-[10px] text-slate-400">Shift status: Confirmed on duty</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Marketplace (Browse All Gigs) */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Browse Temporary Gigs in Singapore
            </h2>
            <span className="text-xs text-slate-500">Filtered for your location and skills</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hiringRequests.map((req) => {
              const stall = stalls.find((s) => s.id === req.stallId);
              const isAccepted = req.acceptedWorkerIds.includes(currentWorker.id);
              const isApplied = req.appliedWorkerIds.includes(currentWorker.id);

              return (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">{req.jobRole}</h3>
                        <p className="text-xs text-slate-500">{stall?.name}</p>
                      </div>
                      <span className="font-bold text-slate-900 font-mono">
                        S${req.hourlySalary}/hr
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2">{req.description}</p>

                    <div className="mt-3 text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.startDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">{req.startTime} – {req.endTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    {isAccepted ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Booked
                      </span>
                    ) : (
                      <button
                        onClick={() => acceptJobOffer(req.id, currentWorker.id)}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
                      >
                        Apply / Accept Shift
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl">
          <h2 className="text-base font-bold text-slate-900 mb-1">Worker Profile & Skills</h2>
          <p className="text-xs text-slate-500 mb-5">
            Keep your skills, locations, and rate expectations updated to receive matching offers
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Singapore Phone</label>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Hourly Rate (SGD)</label>
                <input
                  type="number"
                  min={10}
                  max={40}
                  required
                  value={profileForm.preferredHourlyRate}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, preferredHourlyRate: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Food Hygiene Certificate</label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={profileForm.hasFoodHygieneCert}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, hasFoodHygieneCert: e.target.checked })
                    }
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span className="text-slate-700">Valid WSQ Level 1 Food Safety</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bio / Past Experience</label>
              <textarea
                rows={3}
                value={profileForm.bio || ''}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
