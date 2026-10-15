import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { Dashboard } from './components/Dashboard';
import { CompaniesStalls } from './components/CompaniesStalls';
import { StaffScheduling } from './components/StaffScheduling';
import { TempStaffHiring } from './components/TempStaffHiring';
import { WorkerDirectory } from './components/WorkerDirectory';
import { EmergencyReplacement } from './components/EmergencyReplacement';
import { SalaryCalculator } from './components/SalaryCalculator';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { WorkerPortal } from './components/WorkerPortal';
import { InternalStaffPortal } from './components/InternalStaffPortal';
import { Menu, X, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentView, currentRole } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Render view based on navigation and role
  const renderCurrentView = () => {
    // If user clicked or is on worker portal
    if (currentView === 'worker_portal') {
      return <WorkerPortal />;
    }
    // If user clicked or is on internal staff portal
    if (currentView === 'internal_staff') {
      return <InternalStaffPortal />;
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'companies_stalls':
        return <CompaniesStalls />;
      case 'staff_scheduling':
        return <StaffScheduling />;
      case 'temp_hiring':
        return <TempStaffHiring />;
      case 'worker_directory':
        return <WorkerDirectory />;
      case 'emergency_replacement':
        return <EmergencyReplacement />;
      case 'salary_calculator':
        return <SalaryCalculator />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header />

      {/* Mobile Menu Bar for small screens */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-1.5 rounded-lg border border-slate-200"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Navigation Menu</span>
        </button>

        <span className="text-xs font-bold text-slate-700 capitalize">
          {currentView.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-72 bg-white h-full shadow-2xl flex flex-col">
              <div className="p-3 border-b border-slate-100 flex justify-end">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto" onClick={() => setMobileMenuOpen(false)}>
                <Sidebar />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderCurrentView()}
        </main>
      </div>

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
