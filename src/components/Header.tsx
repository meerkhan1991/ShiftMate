import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Clock,
  RotateCcw,
  UserCheck,
  ShieldAlert,
  Briefcase,
  Users,
  Check,
  Building2,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    selectedEmployeeId,
    setSelectedEmployeeId,
    selectedTempWorkerId,
    setSelectedTempWorkerId,
    employees,
    tempWorkers,
    notifications,
    markNotificationRead,
    clearNotifications,
    resetToDemo,
    setCurrentView,
    stalls,
    selectedStallId,
    setSelectedStallId,
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [sgTime, setSgTime] = useState('');

  // Update Singapore 24-hr clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to Asia/Singapore in 24-hr format
      const formatter = new Intl.DateTimeFormat('en-SG', {
        timeZone: 'Asia/Singapore',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setSgTime(formatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const currentTempWorker = tempWorkers.find((w) => w.id === selectedTempWorkerId);
  const activeStall = stalls.find((s) => s.id === selectedStallId);

  // Filter notifications based on role
  const relevantNotifs = notifications.filter((n) => {
    if (currentRole === 'company_admin') return n.recipientRole === 'company_admin';
    if (currentRole === 'temporary_worker') {
      return (
        n.recipientRole === 'temporary_worker' &&
        (!n.recipientWorkerId || n.recipientWorkerId === selectedTempWorkerId)
      );
    }
    return n.recipientRole === 'internal_employee';
  });

  const unreadCount = relevantNotifs.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: Branding & Stall Context */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-base tracking-tight">ShiftMate</span>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
                  Singapore
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Smart F&B & Retail Manpower</p>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden md:block" />

          {/* Stall Context Switcher for Admin */}
          {currentRole === 'company_admin' && (
            <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <select
                value={selectedStallId}
                onChange={(e) => setSelectedStallId(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                {stalls.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.area})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Center / Right: Timezone & Controls */}
        <div className="flex items-center gap-3">
          {/* SGT Time Display */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-medium text-slate-700 font-mono">{sgTime || 'SGT 24h'}</span>
            <span className="text-[10px] text-slate-400 font-sans">(UTC+8)</span>
          </div>

          {/* Interactive Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 shadow-sm transition-colors"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  currentRole === 'company_admin'
                    ? 'bg-blue-600'
                    : currentRole === 'temporary_worker'
                    ? 'bg-teal-500'
                    : 'bg-indigo-500'
                }`}
              />
              <span className="text-slate-500 hidden sm:inline">Role:</span>
              <span className="font-semibold">
                {currentRole === 'company_admin' && 'Company Admin (ABC Food)'}
                {currentRole === 'internal_employee' && `Staff: ${currentEmployee?.name || 'Employee'}`}
                {currentRole === 'temporary_worker' && `Temp: ${currentTempWorker?.name || 'Worker'}`}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded">Switch</span>
            </button>

            {/* Role Switcher Menu */}
            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-xs font-semibold text-slate-800">Switch User Role</p>
                  <p className="text-[11px] text-slate-500">Test different perspectives for demo</p>
                </div>

                {/* Company Admin */}
                <button
                  onClick={() => {
                    setCurrentRole('company_admin');
                    setCurrentView('dashboard');
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors ${
                    currentRole === 'company_admin' ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold">Company Administrator</p>
                      {currentRole === 'company_admin' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500">ABC Food Pte Ltd (Full Access)</p>
                  </div>
                </button>

                {/* Temporary Worker Options */}
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="px-2 text-[10px] uppercase font-bold tracking-wider text-teal-700">
                    Temporary Worker Portal
                  </p>
                  {tempWorkers.slice(0, 2).map((worker) => (
                    <button
                      key={worker.id}
                      onClick={() => {
                        setSelectedTempWorkerId(worker.id);
                        setCurrentRole('temporary_worker');
                        setCurrentView('worker_portal');
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors mt-1 ${
                        currentRole === 'temporary_worker' && selectedTempWorkerId === worker.id
                          ? 'bg-teal-50 text-teal-900'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold">{worker.name}</p>
                          {currentRole === 'temporary_worker' && selectedTempWorkerId === worker.id && (
                            <Check className="w-3.5 h-3.5 text-teal-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {worker.preferredLocations[0]} · S${worker.preferredHourlyRate}/hr · Rating {worker.rating}★
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Internal Employee Options */}
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="px-2 text-[10px] uppercase font-bold tracking-wider text-indigo-700">
                    Internal Staff Portal
                  </p>
                  {employees.slice(0, 2).map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmployeeId(emp.id);
                        setCurrentRole('internal_employee');
                        setCurrentView('internal_staff');
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors mt-1 ${
                        currentRole === 'internal_employee' && selectedEmployeeId === emp.id
                          ? 'bg-indigo-50 text-indigo-900'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold">{emp.name}</p>
                          {currentRole === 'internal_employee' && selectedEmployeeId === emp.id && (
                            <Check className="w-3.5 h-3.5 text-indigo-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {emp.role} · {emp.employmentType}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {relevantNotifs.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[11px] text-slate-500 hover:text-slate-800"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-1">
                  {relevantNotifs.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications for this role.
                    </div>
                  ) : (
                    relevantNotifs.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                          !n.read ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(n.timestamp).toLocaleTimeString('en-SG', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={resetToDemo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition-colors"
            title="Reset to 15 Oct 2026 Singapore Demo Scenario"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
