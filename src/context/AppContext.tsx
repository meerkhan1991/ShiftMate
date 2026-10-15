import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Company,
  Stall,
  Employee,
  TempWorker,
  Shift,
  HiringRequest,
  InAppNotification,
  UserRole,
  StaffingStatus,
} from '../types';
import {
  INITIAL_COMPANY,
  INITIAL_STALLS,
  INITIAL_EMPLOYEES,
  INITIAL_TEMP_WORKERS,
  INITIAL_SHIFTS,
  INITIAL_HIRING_REQUESTS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppContextType {
  // Navigation & Role State
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedStallId: string;
  setSelectedStallId: (id: string) => void;
  currentDate: string; // YYYY-MM-DD
  setCurrentDate: (date: string) => void;

  // Active Personas
  selectedEmployeeId: string;
  setSelectedEmployeeId: (id: string) => void;
  selectedTempWorkerId: string;
  setSelectedTempWorkerId: (id: string) => void;

  // Data
  company: Company;
  updateCompany: (company: Company) => void;
  stalls: Stall[];
  addStall: (stall: Omit<Stall, 'id'>) => void;
  updateStall: (stall: Stall) => void;
  deleteStall: (id: string) => void;

  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (emp: Employee) => void;

  tempWorkers: TempWorker[];
  addTempWorker: (worker: Omit<TempWorker, 'id'>) => void;
  updateTempWorker: (worker: TempWorker) => void;

  shifts: Shift[];
  addShift: (shift: Omit<Shift, 'id' | 'createdAt'>) => string;
  updateShift: (shift: Shift) => void;
  deleteShift: (id: string) => void;

  hiringRequests: HiringRequest[];
  createHiringRequest: (req: Omit<HiringRequest, 'id' | 'createdAt'>) => string;
  updateHiringRequest: (req: HiringRequest) => void;
  sendRequestToWorker: (requestId: string, workerId: string) => void;

  notifications: InAppNotification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Workflows & Actions
  assignWorkerToShift: (
    shiftId: string,
    workerId: string,
    workerType: 'permanent' | 'temporary',
    hourlyRate?: number
  ) => { success: boolean; error?: string };

  removeWorkerFromShift: (shiftId: string, workerId: string) => void;

  reportAbsence: (
    shiftId: string,
    workerId: string,
    reason: string
  ) => void;

  acceptJobOffer: (requestId: string, workerId: string) => boolean;
  declineJobOffer: (requestId: string, workerId: string, reason?: string) => void;

  // Helpers
  checkWorkerConflict: (
    workerId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeShiftId?: string
  ) => { hasConflict: boolean; conflictingShift?: Shift };

  getShiftStaffingStatus: (shift: Shift) => {
    status: StaffingStatus;
    confirmedCount: number;
    shortage: number;
    color: 'emerald' | 'amber' | 'rose';
    label: string;
  };

  resetToDemo: () => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
}

const STORAGE_KEY = 'shiftmate_sg_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation & Role
  const [currentRole, setCurrentRole] = useState<UserRole>('company_admin');
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedStallId, setSelectedStallId] = useState<string>('stall-tampines');
  const [currentDate, setCurrentDate] = useState<string>('2026-10-15');

  // Active Personas
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('emp-1');
  const [selectedTempWorkerId, setSelectedTempWorkerId] = useState<string>('temp-1');

  // Persistence State
  const [company, setCompany] = useState<Company>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_company`);
      return saved ? JSON.parse(saved) : INITIAL_COMPANY;
    } catch {
      return INITIAL_COMPANY;
    }
  });

  const [stalls, setStalls] = useState<Stall[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_stalls`);
      return saved ? JSON.parse(saved) : INITIAL_STALLS;
    } catch {
      return INITIAL_STALLS;
    }
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_employees`);
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [tempWorkers, setTempWorkers] = useState<TempWorker[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_temp_workers`);
      return saved ? JSON.parse(saved) : INITIAL_TEMP_WORKERS;
    } catch {
      return INITIAL_TEMP_WORKERS;
    }
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_shifts`);
      return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
    } catch {
      return INITIAL_SHIFTS;
    }
  });

  const [hiringRequests, setHiringRequests] = useState<HiringRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_hiring_requests`);
      return saved ? JSON.parse(saved) : INITIAL_HIRING_REQUESTS;
    } catch {
      return INITIAL_HIRING_REQUESTS;
    }
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_company`, JSON.stringify(company));
      localStorage.setItem(`${STORAGE_KEY}_stalls`, JSON.stringify(stalls));
      localStorage.setItem(`${STORAGE_KEY}_employees`, JSON.stringify(employees));
      localStorage.setItem(`${STORAGE_KEY}_temp_workers`, JSON.stringify(tempWorkers));
      localStorage.setItem(`${STORAGE_KEY}_shifts`, JSON.stringify(shifts));
      localStorage.setItem(`${STORAGE_KEY}_hiring_requests`, JSON.stringify(hiringRequests));
      localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [company, stalls, employees, tempWorkers, shifts, hiringRequests, notifications]);

  // Push notifications helper
  const addNotification = (notif: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: InAppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Conflict detection
  const checkWorkerConflict = (
    workerId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeShiftId?: string
  ): { hasConflict: boolean; conflictingShift?: Shift } => {
    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const targetStart = toMinutes(startTime);
    const targetEnd = toMinutes(endTime);

    const conflictingShift = shifts.find((shift) => {
      if (excludeShiftId && shift.id === excludeShiftId) return false;
      if (shift.date !== date) return false;

      // Check if this worker is confirmed on this shift
      const isAssigned = shift.assignedStaff.some(
        (staff) => staff.workerId === workerId && staff.status === 'confirmed'
      );
      if (!isAssigned) return false;

      const sStart = toMinutes(shift.startTime);
      const sEnd = toMinutes(shift.endTime);

      // Overlap condition
      return targetStart < sEnd && targetEnd > sStart;
    });

    return {
      hasConflict: !!conflictingShift,
      conflictingShift,
    };
  };

  // Calculate staffing status according to Module 2 rules:
  // Shortage = Max(Required Headcount - Confirmed Assigned Staff, 0)
  // Green: Fully staffed (Shortage = 0)
  // Orange: Partially staffed (Shortage > 0, Confirmed > 0)
  // Red: No staff assigned (Confirmed = 0)
  const getShiftStaffingStatus = (shift: Shift) => {
    const confirmedCount = shift.assignedStaff.filter((s) => s.status === 'confirmed').length;
    const shortage = Math.max(shift.requiredHeadcount - confirmedCount, 0);

    let status: StaffingStatus = 'no_staff';
    let color: 'emerald' | 'amber' | 'rose' = 'rose';
    let label = 'No Staff Assigned';

    if (confirmedCount >= shift.requiredHeadcount) {
      status = 'fully_staffed';
      color = 'emerald';
      label = 'Fully Staffed';
    } else if (confirmedCount > 0) {
      status = 'partially_staffed';
      color = 'amber';
      label = `Short of ${shortage} Staff`;
    } else {
      status = 'no_staff';
      color = 'rose';
      label = `Unstaffed (${shortage} Needed)`;
    }

    return { status, confirmedCount, shortage, color, label };
  };

  // Assign worker with conflict validation
  const assignWorkerToShift = (
    shiftId: string,
    workerId: string,
    workerType: 'permanent' | 'temporary',
    hourlyRate?: number
  ) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return { success: false, error: 'Shift not found' };

    // Check conflict
    const conflict = checkWorkerConflict(
      workerId,
      shift.date,
      shift.startTime,
      shift.endTime,
      shift.id
    );
    if (conflict.hasConflict) {
      const conflictMsg = `Schedule Conflict: This worker is already assigned to "${conflict.conflictingShift?.taskTitle}" (${conflict.conflictingShift?.startTime}–${conflict.conflictingShift?.endTime}) on ${shift.date}.`;
      showToast('Assignment Blocked', conflictMsg, 'error');
      return { success: false, error: conflictMsg };
    }

    let workerName = '';
    let rate = hourlyRate ?? shift.hourlyRate;

    if (workerType === 'permanent') {
      const emp = employees.find((e) => e.id === workerId);
      if (!emp) return { success: false, error: 'Employee not found' };
      workerName = emp.name;
      rate = emp.hourlyRate;
    } else {
      const temp = tempWorkers.find((t) => t.id === workerId);
      if (!temp) return { success: false, error: 'Temporary worker not found' };
      workerName = temp.name;
      rate = hourlyRate ?? temp.preferredHourlyRate;
    }

    // Check if already in assigned list
    const existingIndex = shift.assignedStaff.findIndex((s) => s.workerId === workerId);
    let updatedStaff = [...shift.assignedStaff];

    if (existingIndex >= 0) {
      // Re-confirm if previously absent
      updatedStaff[existingIndex] = {
        ...updatedStaff[existingIndex],
        status: 'confirmed',
        absenceReason: undefined,
      };
    } else {
      updatedStaff.push({
        workerId,
        workerName,
        workerType,
        assignedAt: new Date().toISOString(),
        status: 'confirmed',
        hourlyRate: rate,
      });
    }

    setShifts((prev) =>
      prev.map((s) => (s.id === shiftId ? { ...s, assignedStaff: updatedStaff } : s))
    );

    showToast(
      'Worker Assigned',
      `${workerName} has been assigned to ${shift.taskTitle} on ${shift.date}.`,
      'success'
    );

    return { success: true };
  };

  const removeWorkerFromShift = (shiftId: string, workerId: string) => {
    setShifts((prev) =>
      prev.map((shift) => {
        if (shift.id !== shiftId) return shift;
        const staffToRemove = shift.assignedStaff.find((s) => s.workerId === workerId);
        const updated = shift.assignedStaff.filter((s) => s.workerId !== workerId);
        if (staffToRemove) {
          showToast(
            'Worker Removed',
            `${staffToRemove.workerName} was unassigned from ${shift.taskTitle}.`,
            'info'
          );
        }
        return { ...shift, assignedStaff: updated };
      })
    );
  };

  // Module 5: Emergency Replacement Flow - Mark employee absent
  const reportAbsence = (shiftId: string, workerId: string, reason: string) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return;

    let workerName = 'Staff member';
    const updatedStaff = shift.assignedStaff.map((staff) => {
      if (staff.workerId === workerId) {
        workerName = staff.workerName;
        return {
          ...staff,
          status: 'reported_absent' as const,
          absenceReason: reason || 'Medical Certificate (MC) / Emergency Absence',
        };
      }
      return staff;
    });

    setShifts((prev) =>
      prev.map((s) => (s.id === shiftId ? { ...s, assignedStaff: updatedStaff } : s))
    );

    // Calculate new shortage
    const confirmedCount = updatedStaff.filter((s) => s.status === 'confirmed').length;
    const newShortage = Math.max(shift.requiredHeadcount - confirmedCount, 0);

    // Alert company admin
    addNotification({
      recipientRole: 'company_admin',
      title: `Emergency: ${workerName} Reported MC / Absence`,
      message: `Shift: ${shift.taskTitle} (${shift.date} ${shift.startTime}–${shift.endTime}). Reason: "${reason}". Shortage increased to ${newShortage} staff.`,
      type: 'absence_reported',
    });

    showToast(
      'Absence Recorded',
      `${workerName} marked absent. Manpower shortage updated to ${newShortage}.`,
      'warning'
    );
  };

  // Module 3 & 4: Worker Job Offer Acceptance Flow
  const acceptJobOffer = (requestId: string, workerId: string): boolean => {
    const request = hiringRequests.find((r) => r.id === requestId);
    const worker = tempWorkers.find((w) => w.id === workerId);
    if (!request || !worker) return false;

    // Check conflict
    const conflict = checkWorkerConflict(
      workerId,
      request.startDate,
      request.startTime,
      request.endTime,
      request.linkedShiftId
    );
    if (conflict.hasConflict) {
      showToast(
        'Schedule Conflict',
        `Cannot accept offer: you already have an overlapping shift on ${request.startDate}.`,
        'error'
      );
      return false;
    }

    const updatedAccepted = Array.from(new Set([...request.acceptedWorkerIds, workerId]));
    const updatedApplied = request.appliedWorkerIds.filter((id) => id !== workerId);

    const isFullyFilled = updatedAccepted.length >= request.requiredHeadcount;
    const newStatus = isFullyFilled
      ? 'filled'
      : updatedAccepted.length > 0
      ? 'partially_filled'
      : 'open';

    setHiringRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              acceptedWorkerIds: updatedAccepted,
              appliedWorkerIds: updatedApplied,
              status: newStatus,
            }
          : r
      )
    );

    // If linked to a shift, assign immediately as temporary worker
    if (request.linkedShiftId) {
      const shift = shifts.find((s) => s.id === request.linkedShiftId);
      if (shift) {
        const isAlreadyAssigned = shift.assignedStaff.some((s) => s.workerId === workerId);
        let newStaffList = [...shift.assignedStaff];

        if (isAlreadyAssigned) {
          newStaffList = newStaffList.map((s) =>
            s.workerId === workerId ? { ...s, status: 'confirmed' } : s
          );
        } else {
          newStaffList.push({
            workerId: worker.id,
            workerName: worker.name,
            workerType: 'temporary',
            assignedAt: new Date().toISOString(),
            status: 'confirmed',
            hourlyRate: request.hourlySalary,
          });
        }

        setShifts((prevShifts) =>
          prevShifts.map((s) =>
            s.id === shift.id ? { ...s, assignedStaff: newStaffList } : s
          )
        );
      }
    }

    // Add notifications
    addNotification({
      recipientRole: 'company_admin',
      title: `Offer Accepted: ${worker.name}`,
      message: `${worker.name} accepted the temporary job for ${request.jobRole} on ${request.startDate} (${request.startTime}–${request.endTime}) at S$${request.hourlySalary}/hr.`,
      type: 'offer_accepted',
    });

    addNotification({
      recipientRole: 'temporary_worker',
      recipientWorkerId: worker.id,
      title: 'Booking Confirmed!',
      message: `You are booked for ${request.jobRole} on ${request.startDate} (${request.startTime}–${request.endTime}). View details in Confirmed Assignments.`,
      type: 'general',
    });

    showToast(
      'Shift Confirmed!',
      `You successfully accepted the shift for ${request.jobRole} on ${request.startDate}.`,
      'success'
    );

    return true;
  };

  const declineJobOffer = (requestId: string, workerId: string, reason?: string) => {
    const request = hiringRequests.find((r) => r.id === requestId);
    const worker = tempWorkers.find((w) => w.id === workerId);
    if (!request || !worker) return;

    setHiringRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          appliedWorkerIds: r.appliedWorkerIds.filter((id) => id !== workerId),
          declinedWorkerIds: Array.from(new Set([...r.declinedWorkerIds, workerId])),
        };
      })
    );

    addNotification({
      recipientRole: 'company_admin',
      title: `Offer Declined: ${worker.name}`,
      message: `${worker.name} declined the offer for ${request.jobRole} on ${request.startDate}. ${
        reason ? `Reason: ${reason}` : ''
      }`,
      type: 'offer_declined',
    });

    showToast('Offer Declined', `You declined the shift offer for ${request.jobRole}.`, 'info');
  };

  const sendRequestToWorker = (requestId: string, workerId: string) => {
    const request = hiringRequests.find((r) => r.id === requestId);
    const worker = tempWorkers.find((w) => w.id === workerId);
    if (!request || !worker) return;

    if (request.appliedWorkerIds.includes(workerId)) {
      showToast('Already Sent', `An invitation was already sent to ${worker.name}.`, 'warning');
      return;
    }

    setHiringRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              appliedWorkerIds: [...r.appliedWorkerIds, workerId],
              status: r.status === 'open' ? 'pending_acceptance' : r.status,
            }
          : r
      )
    );

    // Send notification to worker
    addNotification({
      recipientRole: 'temporary_worker',
      recipientWorkerId: worker.id,
      title: request.isUrgent ? '🔥 Urgent Shift Offer (SGD ' + request.hourlySalary + '/hr)' : 'New Shift Offer',
      message: `${company.name} offered you a shift: ${request.jobRole} on ${request.startDate} (${request.startTime}–${request.endTime}). Tap to accept!`,
      type: 'job_offer',
    });

    showToast(
      'Request Sent',
      `Shift invitation sent to ${worker.name} (${worker.phone}).`,
      'success'
    );
  };

  // CRUD Operations
  const updateCompany = (updated: Company) => {
    setCompany(updated);
    showToast('Company Updated', 'Company details saved successfully.', 'success');
  };

  const addStall = (newStall: Omit<Stall, 'id'>) => {
    const id = `stall-${Date.now()}`;
    setStalls((prev) => [...prev, { ...newStall, id }]);
    showToast('Stall Added', `New stall "${newStall.name}" created.`, 'success');
  };

  const updateStall = (updated: Stall) => {
    setStalls((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast('Stall Updated', `Stall "${updated.name}" updated.`, 'success');
  };

  const deleteStall = (id: string) => {
    setStalls((prev) => prev.filter((s) => s.id !== id));
    showToast('Stall Deleted', 'Stall removed from management.', 'info');
  };

  const addEmployee = (emp: Omit<Employee, 'id'>) => {
    const id = `emp-${Date.now()}`;
    setEmployees((prev) => [...prev, { ...emp, id }]);
    showToast('Employee Added', `${emp.name} added to staff roster.`, 'success');
  };

  const updateEmployee = (emp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? emp : e)));
    showToast('Employee Updated', `${emp.name} profile updated.`, 'success');
  };

  const addTempWorker = (worker: Omit<TempWorker, 'id'>) => {
    const id = `temp-${Date.now()}`;
    setTempWorkers((prev) => [...prev, { ...worker, id }]);
    showToast('Profile Registered', `Worker profile for ${worker.name} created.`, 'success');
  };

  const updateTempWorker = (worker: TempWorker) => {
    setTempWorkers((prev) => prev.map((w) => (w.id === worker.id ? worker : w)));
    showToast('Profile Updated', 'Worker profile updated successfully.', 'success');
  };

  const addShift = (shiftData: Omit<Shift, 'id' | 'createdAt'>): string => {
    const id = `shift-${Date.now()}`;
    const newShift: Shift = {
      ...shiftData,
      id,
      createdAt: new Date().toISOString(),
    };
    setShifts((prev) => [newShift, ...prev]);
    showToast('Shift Created', `Shift "${shiftData.taskTitle}" scheduled for ${shiftData.date}.`, 'success');
    return id;
  };

  const updateShift = (updated: Shift) => {
    setShifts((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast('Shift Updated', `Shift "${updated.taskTitle}" updated.`, 'success');
  };

  const deleteShift = (id: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== id));
    showToast('Shift Cancelled', 'Shift removed from calendar.', 'info');
  };

  const createHiringRequest = (req: Omit<HiringRequest, 'id' | 'createdAt'>): string => {
    const id = `req-${Date.now()}`;
    const newReq: HiringRequest = {
      ...req,
      id,
      createdAt: new Date().toISOString(),
    };
    setHiringRequests((prev) => [newReq, ...prev]);

    // Send notifications to applied workers
    newReq.appliedWorkerIds.forEach((workerId) => {
      const worker = tempWorkers.find((w) => w.id === workerId);
      if (worker) {
        addNotification({
          recipientRole: 'temporary_worker',
          recipientWorkerId: worker.id,
          title: newReq.isUrgent ? '🔥 Urgent Shift Invitation' : 'New Shift Invitation',
          message: `${company.name} invites you to work as ${newReq.jobRole} on ${newReq.startDate} (${newReq.startTime}–${newReq.endTime}) for S$${newReq.hourlySalary}/hr.`,
          type: 'job_offer',
        });
      }
    });

    showToast('Hiring Request Posted', `Request for ${req.requiredHeadcount} ${req.jobRole}(s) created.`, 'success');
    return id;
  };

  const updateHiringRequest = (updated: HiringRequest) => {
    setHiringRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    showToast('Request Updated', 'Hiring request details saved.', 'success');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast('Notifications Cleared', 'All notifications removed.', 'info');
  };

  const resetToDemo = () => {
    localStorage.removeItem(`${STORAGE_KEY}_company`);
    localStorage.removeItem(`${STORAGE_KEY}_stalls`);
    localStorage.removeItem(`${STORAGE_KEY}_employees`);
    localStorage.removeItem(`${STORAGE_KEY}_temp_workers`);
    localStorage.removeItem(`${STORAGE_KEY}_shifts`);
    localStorage.removeItem(`${STORAGE_KEY}_hiring_requests`);
    localStorage.removeItem(`${STORAGE_KEY}_notifications`);

    setCompany(INITIAL_COMPANY);
    setStalls(INITIAL_STALLS);
    setEmployees(INITIAL_EMPLOYEES);
    setTempWorkers(INITIAL_TEMP_WORKERS);
    setShifts(INITIAL_SHIFTS);
    setHiringRequests(INITIAL_HIRING_REQUESTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSelectedStallId('stall-tampines');
    setCurrentDate('2026-10-15');
    setCurrentRole('company_admin');
    setCurrentView('dashboard');

    showToast(
      'Demo Reset Complete',
      'Restored initial scenario: 15 Oct 2026 ABC Chicken Rice with 2-person shortage.',
      'success'
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentView,
        setCurrentView,
        selectedStallId,
        setSelectedStallId,
        currentDate,
        setCurrentDate,
        selectedEmployeeId,
        setSelectedEmployeeId,
        selectedTempWorkerId,
        setSelectedTempWorkerId,
        company,
        updateCompany,
        stalls,
        addStall,
        updateStall,
        deleteStall,
        employees,
        addEmployee,
        updateEmployee,
        tempWorkers,
        addTempWorker,
        updateTempWorker,
        shifts,
        addShift,
        updateShift,
        deleteShift,
        hiringRequests,
        createHiringRequest,
        updateHiringRequest,
        sendRequestToWorker,
        notifications,
        markNotificationRead,
        clearNotifications,
        assignWorkerToShift,
        removeWorkerFromShift,
        reportAbsence,
        acceptJobOffer,
        declineJobOffer,
        checkWorkerConflict,
        getShiftStaffingStatus,
        resetToDemo,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
