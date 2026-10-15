import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Contact2,
  Users,
  Search,
  Filter,
  Plus,
  Star,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle,
  Briefcase,
  X,
} from 'lucide-react';
import { Employee, TempWorker } from '../types';

export const WorkerDirectory: React.FC = () => {
  const { employees, tempWorkers, stalls, addEmployee, addTempWorker } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'internal' | 'temporary'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newStaffType, setNewStaffType] = useState<'internal' | 'temporary'>('internal');

  // New staff form
  const [empForm, setEmpForm] = useState({
    name: '',
    role: 'Service Crew',
    phone: '+65 ',
    email: '',
    hourlyRate: 13,
    employmentType: 'Full-Time' as Employee['employmentType'],
    skills: 'Service Crew, POS System',
    stallId: stalls[0]?.id || '',
  });

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTempWorkers = tempWorkers.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      w.preferredLocations.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.name.trim()) return;

    if (newStaffType === 'internal') {
      addEmployee({
        companyId: 'comp-abc',
        stallId: empForm.stallId || stalls[0].id,
        name: empForm.name,
        email: empForm.email || `${empForm.name.toLowerCase().replace(/\s+/g, '.')}@abcfood.sg`,
        phone: empForm.phone,
        role: empForm.role,
        skills: empForm.skills.split(',').map((s) => s.trim()),
        hourlyRate: Number(empForm.hourlyRate),
        employmentType: empForm.employmentType,
      });
    } else {
      addTempWorker({
        name: empForm.name,
        email: empForm.email || `${empForm.name.toLowerCase().replace(/\s+/g, '.')}@casual.sg`,
        phone: empForm.phone,
        skills: empForm.skills.split(',').map((s) => s.trim()),
        preferredLocations: ['Tampines', 'East'],
        preferredHourlyRate: Number(empForm.hourlyRate),
        hasFoodHygieneCert: true,
        rating: 5.0,
        completedShiftsCount: 0,
        availableDays: ['Thursday', 'Friday', 'Saturday', 'Sunday'],
        availableHours: '09:00 - 21:00',
        bio: 'New verified casual worker ready for F&B shifts.',
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Worker Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete database of in-house stall employees and verified Singapore temporary gig staff
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Worker</span>
        </button>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Workers ({employees.length + tempWorkers.length})
          </button>
          <button
            onClick={() => setActiveTab('internal')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'internal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In-House Staff ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('temporary')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'temporary' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Temporary Workers ({tempWorkers.length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, skill, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Workers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Internal Staff Cards */}
        {(activeTab === 'all' || activeTab === 'internal') &&
          filteredEmployees.map((emp) => {
            const stall = stalls.find((s) => s.id === emp.stallId);

            return (
              <div
                key={emp.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        {emp.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{emp.name}</h3>
                        <p className="text-xs text-indigo-600 font-semibold">{emp.role}</p>
                      </div>
                    </div>

                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {emp.employmentType}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">{emp.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{stall?.name || 'Stall'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {emp.skills.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Hourly Rate:</span>
                  <span className="font-bold font-mono text-slate-900">S${emp.hourlyRate}/hr</span>
                </div>
              </div>
            );
          })}

        {/* Temporary Workers Cards */}
        {(activeTab === 'all' || activeTab === 'temporary') &&
          filteredTempWorkers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl border border-teal-100 p-5 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold">
                      {worker.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-slate-900">{worker.name}</h3>
                        {worker.hasFoodHygieneCert && (
                          <span title="WSQ Food Safety">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-teal-700 font-semibold">Verified Temp Worker</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{worker.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {worker.bio}
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{worker.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Prefers: {worker.preferredLocations.join(', ')}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500 mb-1">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {worker.skills.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Expected Rate:</span>
                <span className="font-bold font-mono text-slate-900">
                  S${worker.preferredHourlyRate}/hr
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* Add Worker Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Add New Worker</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Worker Category</label>
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setNewStaffType('internal')}
                    className={`flex-1 py-1.5 rounded-md font-semibold ${
                      newStaffType === 'internal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    In-House Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStaffType('temporary')}
                    className={`flex-1 py-1.5 rounded-md font-semibold ${
                      newStaffType === 'temporary' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Temporary Gig Worker
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Benjamin Tan"
                  value={empForm.name}
                  onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Singapore Phone</label>
                  <input
                    type="text"
                    required
                    value={empForm.phone}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hourly Wage (SGD)</label>
                  <input
                    type="number"
                    min={10}
                    max={40}
                    required
                    value={empForm.hourlyRate}
                    onChange={(e) => setEmpForm({ ...empForm, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={empForm.skills}
                  onChange={(e) => setEmpForm({ ...empForm, skills: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
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
                  Add Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
