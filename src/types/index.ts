export type UserRole = 'company_admin' | 'internal_employee' | 'temporary_worker';

export interface Company {
  id: string;
  name: string;
  uen: string; // Unique Entity Number in Singapore
  contactEmail: string;
  contactPhone: string;
  address: string;
}

export interface Stall {
  id: string;
  companyId: string;
  name: string;
  cuisineOrType: string;
  location: string; // e.g. "Tampines Century Square #01-14, Singapore"
  area: 'East' | 'West' | 'Central' | 'North' | 'North-East';
  operatingHours: string; // "09:00 - 21:00"
  phone: string;
}

export interface Employee {
  id: string;
  companyId: string;
  stallId: string;
  name: string;
  email: string;
  phone: string;
  role: string; // e.g., "Cashier", "Service Crew", "Kitchen Helper", "Cook"
  skills: string[];
  hourlyRate: number; // SGD
  employmentType: 'Full-Time' | 'Part-Time';
  avatar?: string;
  availabilityNotes?: string;
}

export interface TempWorker {
  id: string;
  name: string;
  phone: string;
  email: string;
  skills: string[]; // e.g. "Service Crew", "Cashier", "Food Hygiene Cert", "Barista", "Dishwasher"
  preferredLocations: string[]; // e.g. ["Tampines", "Bedok", "East"]
  preferredHourlyRate: number; // SGD
  hasFoodHygieneCert: boolean;
  rating: number; // e.g. 4.9
  completedShiftsCount: number;
  availableDays: string[]; // ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  availableHours: string; // "08:00 - 22:00"
  avatar?: string;
  bio?: string;
}

export interface ShiftAssignment {
  workerId: string;
  workerName: string;
  workerType: 'permanent' | 'temporary';
  assignedAt: string;
  status: 'confirmed' | 'reported_absent' | 'completed';
  absenceReason?: string;
  hourlyRate: number;
}

export interface Shift {
  id: string;
  companyId: string;
  stallId: string;
  taskTitle: string; // e.g. "Service Crew", "Cashier", "Kitchen Prep"
  description: string;
  date: string; // YYYY-MM-DD (e.g. "2026-10-15")
  startTime: string; // 24-hr format "09:00"
  endTime: string; // 24-hr format "17:00"
  breakMinutes: number; // Unpaid break minutes, default 30 or 60
  requiredHeadcount: number;
  assignedStaff: ShiftAssignment[];
  hourlyRate: number; // SGD default rate for this shift
  notes?: string;
  isRecurring?: boolean;
  recurrencePattern?: 'daily' | 'weekdays' | 'weekends' | 'weekly';
  createdAt: string;
}

export interface HiringRequest {
  id: string;
  companyId: string;
  stallId: string;
  jobRole: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  applicableDays?: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  startTime: string; // "12:00"
  endTime: string; // "20:00"
  breakMinutes: number;
  requiredHeadcount: number;
  hourlySalary: number; // SGD
  requirements: string[]; // e.g. "Basic Food Hygiene Certificate", "Able to handle POS"
  isUrgent: boolean;
  status: 'open' | 'pending_acceptance' | 'partially_filled' | 'filled' | 'cancelled';
  linkedShiftId?: string;
  appliedWorkerIds: string[]; // Workers who were sent request or applied
  acceptedWorkerIds: string[]; // Workers who confirmed
  declinedWorkerIds: string[];
  createdAt: string;
}

export interface InAppNotification {
  id: string;
  recipientRole: UserRole;
  recipientWorkerId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLink?: string;
  type: 'emergency_alert' | 'job_offer' | 'offer_accepted' | 'offer_declined' | 'absence_reported' | 'general';
}

export type StaffingStatus = 'fully_staffed' | 'partially_staffed' | 'no_staff';
