import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Store,
  MapPin,
  Clock,
  Phone,
  Plus,
  Pencil,
  Trash2,
  Users,
  CheckCircle2,
  X,
  UserCheck,
} from 'lucide-react';
import { Stall } from '../types';

export const CompaniesStalls: React.FC = () => {
  const {
    company,
    updateCompany,
    stalls,
    addStall,
    updateStall,
    deleteStall,
    employees,
    selectedStallId,
    setSelectedStallId,
  } = useApp();

  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState(company);

  const [stallModalOpen, setStallModalOpen] = useState(false);
  const [editingStall, setEditingStall] = useState<Stall | null>(null);
  const [stallForm, setStallForm] = useState({
    name: '',
    cuisineOrType: '',
    location: '',
    area: 'East' as Stall['area'],
    operatingHours: '09:00 - 21:00',
    phone: '+65 6789 1234',
  });

  const handleOpenStallModal = (stall?: Stall) => {
    if (stall) {
      setEditingStall(stall);
      setStallForm({
        name: stall.name,
        cuisineOrType: stall.cuisineOrType,
        location: stall.location,
        area: stall.area,
        operatingHours: stall.operatingHours,
        phone: stall.phone,
      });
    } else {
      setEditingStall(null);
      setStallForm({
        name: '',
        cuisineOrType: 'F&B Food Kiosk',
        location: '',
        area: 'East',
        operatingHours: '09:00 - 21:00',
        phone: '+65 ',
      });
    }
    setStallModalOpen(true);
  };

  const handleSaveStall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stallForm.name.trim() || !stallForm.location.trim()) return;

    if (editingStall) {
      updateStall({
        ...editingStall,
        ...stallForm,
      });
    } else {
      addStall({
        companyId: company.id,
        ...stallForm,
      });
    }
    setStallModalOpen(false);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany(companyForm);
    setIsEditingCompany(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Companies & Stalls Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your registered corporate entity, food stalls, retail outlets and outlet staff
          </p>
        </div>

        <button
          onClick={() => handleOpenStallModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Stall</span>
        </button>
      </div>

      {/* Module 1 Part A: Company Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{company.name}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono">UEN: {company.uen}</span>
                <span>·</span>
                <span>Singapore Registered Entity</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setCompanyForm(company);
              setIsEditingCompany(!isEditingCompany);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-400" />
            <span>{isEditingCompany ? 'Cancel' : 'Edit Company'}</span>
          </button>
        </div>

        {isEditingCompany ? (
          <form onSubmit={handleSaveCompany} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Name</label>
              <input
                type="text"
                required
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">UEN (Unique Entity Number)</label>
              <input
                type="text"
                required
                value={companyForm.uen}
                onChange={(e) => setCompanyForm({ ...companyForm, uen: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                required
                value={companyForm.contactEmail}
                onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                required
                value={companyForm.contactPhone}
                onChange={(e) => setCompanyForm({ ...companyForm, contactPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Address</label>
              <input
                type="text"
                required
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingCompany(false)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block mb-0.5">Contact</span>
              <p className="font-medium text-slate-800">{company.contactEmail}</p>
              <p className="font-mono text-slate-600">{company.contactPhone}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-slate-400 block mb-0.5">HQ Address</span>
              <p className="font-medium text-slate-800">{company.address}</p>
            </div>
          </div>
        )}
      </div>

      {/* Module 1 Part B: Outlets & Stalls List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Managed Stalls & Outlets ({stalls.length})
          </h2>
          <span className="text-xs text-slate-500">
            Click on a stall to filter schedules and workforce
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stalls.map((stall) => {
            const assignedEmployees = employees.filter((e) => e.stallId === stall.id);
            const isSelected = selectedStallId === stall.id;

            return (
              <div
                key={stall.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                        <Store className="w-4 h-4 text-slate-700" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 leading-tight">
                          {stall.name}
                        </h3>
                        <p className="text-[11px] text-slate-500">{stall.cuisineOrType}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenStallModal(stall)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit Stall"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {stalls.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${stall.name}?`)) {
                              deleteStall(stall.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Stall"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{stall.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-slate-700">{stall.operatingHours}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {stall.area} Area
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{stall.phone}</span>
                    </div>
                  </div>

                  {/* Assigned Permanent Staff for this stall */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>Staff Assigned ({assignedEmployees.length})</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {assignedEmployees.length === 0 ? (
                        <span className="text-[11px] text-slate-400">No staff assigned</span>
                      ) : (
                        assignedEmployees.map((emp) => (
                          <span
                            key={emp.id}
                            className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                          >
                            {emp.name} ({emp.role})
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedStallId(stall.id)}
                    className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ Current Active Stall' : 'Select for Scheduling'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Stall Modal */}
      {stallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingStall ? 'Edit Stall Details' : 'Add New Stall / Outlet'}
              </h3>
              <button
                onClick={() => setStallModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStall} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Stall / Outlet Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Chicken Rice (Tampines)"
                  value={stallForm.name}
                  onChange={(e) => setStallForm({ ...stallForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cuisine / Outlet Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hainanese Chicken Rice & Roast Meats"
                  value={stallForm.cuisineOrType}
                  onChange={(e) => setStallForm({ ...stallForm, cuisineOrType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location & Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tampines Century Square #01-14, Singapore"
                  value={stallForm.location}
                  onChange={(e) => setStallForm({ ...stallForm, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Singapore Area</label>
                  <select
                    value={stallForm.area}
                    onChange={(e) =>
                      setStallForm({ ...stallForm, area: e.target.value as Stall['area'] })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="East">East (Tampines, Bedok)</option>
                    <option value="West">West (Jurong, Clementi)</option>
                    <option value="Central">Central (Bugis, Orchard)</option>
                    <option value="North">North (Woodlands, Yishun)</option>
                    <option value="North-East">North-East (Serangoon)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operating Hours</label>
                  <input
                    type="text"
                    required
                    placeholder="09:00 - 21:00"
                    value={stallForm.operatingHours}
                    onChange={(e) => setStallForm({ ...stallForm, operatingHours: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+65 6789 1234"
                  value={stallForm.phone}
                  onChange={(e) => setStallForm({ ...stallForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStallModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  {editingStall ? 'Save Changes' : 'Create Stall'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
