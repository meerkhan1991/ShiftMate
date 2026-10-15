import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Store,
  CalendarDays,
  UserPlus,
  Contact2,
  AlertOctagon,
  Calculator,
  BarChart3,
  Settings as SettingsIcon,
  Briefcase,
  UserCheck,
  Building,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentRole,
    shifts,
    hiringRequests,
    getShiftStaffingStatus,
    company,
  } = useApp();

  // Count total shortages across today/upcoming shifts
  const shortageCount = shifts.filter((s) => {
    const { shortage } = getShiftStaffingStatus(s);
    return shortage > 0;
  }).length;

  const pendingRequestsCount = hiringRequests.filter(
    (r) => r.status === 'open' || r.status === 'pending_acceptance'
  ).length;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      adminOnly: false,
    },
    {
      id: 'companies_stalls',
      label: 'Companies & Stalls',
      icon: Store,
      badge: null,
      adminOnly: true,
    },
    {
      id: 'staff_scheduling',
      label: 'Staff Scheduling',
      icon: CalendarDays,
      badge: null,
      adminOnly: true,
    },
    {
      id: 'temp_hiring',
      label: 'Temporary Staff Hiring',
      icon: UserPlus,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : null,
      badgeColor: 'bg-blue-100 text-blue-700',
      adminOnly: true,
    },
    {
      id: 'worker_directory',
      label: 'Worker Directory',
      icon: Contact2,
      badge: null,
      adminOnly: true,
    },
    {
      id: 'emergency_replacement',
      label: 'Emergency Replacement',
      icon: AlertOctagon,
      badge: shortageCount > 0 ? `${shortageCount} Alert${shortageCount > 1 ? 's' : ''}` : null,
      badgeColor: 'bg-rose-100 text-rose-700 animate-pulse',
      adminOnly: true,
      highlight: true,
    },
    {
      id: 'salary_calculator',
      label: 'Salary Calculator',
      icon: Calculator,
      badge: 'SGD',
      badgeColor: 'bg-slate-100 text-slate-600',
      adminOnly: false,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      badge: null,
      adminOnly: true,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      badge: null,
      adminOnly: false,
    },
  ];

  // Specific portal tabs for Non-Admin roles
  const roleSpecificTabs = [];
  if (currentRole === 'temporary_worker') {
    roleSpecificTabs.push({
      id: 'worker_portal',
      label: 'My Worker Portal',
      icon: Briefcase,
      badge: 'Active',
      badgeColor: 'bg-teal-100 text-teal-700',
    });
  } else if (currentRole === 'internal_employee') {
    roleSpecificTabs.push({
      id: 'internal_staff',
      label: 'My Staff Shifts & MC',
      icon: UserCheck,
      badge: 'Active',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Company Info Box */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <Building className="w-4 h-4 text-slate-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{company.name}</p>
            <p className="text-[11px] text-slate-500 font-mono">UEN: {company.uen}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Dedicated Persona Portal View if not admin */}
        {roleSpecificTabs.length > 0 && (
          <div className="mb-3 pb-3 border-b border-slate-100">
            <p className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Your Persona View
            </p>
            {roleSpecificTabs.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm'
                      : 'text-teal-800 bg-teal-50/80 hover:bg-teal-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-teal-600'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Management
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isEmergency = item.id === 'emergency_replacement';

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : isEmergency && shortageCount > 0
                  ? 'text-rose-700 hover:bg-rose-50/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-blue-600'
                      : isEmergency && shortageCount > 0
                      ? 'text-rose-600'
                      : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                    item.badgeColor || 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Storage Indicator */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="p-2.5 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-500">
          <div className="flex items-center justify-between font-semibold text-slate-700 mb-1">
            <span>Storage Mode</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          </div>
          <p className="text-[10px] leading-tight text-slate-500">
            Demo Local Storage (Persisted across refreshes).
          </p>
        </div>
      </div>
    </aside>
  );
};
