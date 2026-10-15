import { Request, Response, Router } from 'express';

export interface SalaryCalculationPayload {
  workersCount: number;
  hourlyRate: number;
  shiftHours: number;
  breakMinutes?: number;
  workingDays: number;
  platformFeePercent?: number;
}

export interface SalaryCalculationResult {
  netDailyHoursPerWorker: number;
  totalWorkingHours: number;
  baseLabourCost: number;
  costPerWorker: number;
  platformFee: number;
  totalEstimatedCost: number;
  currency: 'SGD';
  disclaimer: string;
}

/**
 * Calculates estimated labour costs according to Singapore Employment Act / MOM guidelines
 */
export const calculateLabourCost = (
  payload: SalaryCalculationPayload
): SalaryCalculationResult => {
  const {
    workersCount,
    hourlyRate,
    shiftHours,
    breakMinutes = 45,
    workingDays,
    platformFeePercent = 5,
  } = payload;

  const netDailyHoursPerWorker = Math.max(shiftHours - breakMinutes / 60, 0);
  const totalWorkingHours = netDailyHoursPerWorker * workingDays * workersCount;
  const baseLabourCost = totalWorkingHours * hourlyRate;
  const platformFee = (baseLabourCost * platformFeePercent) / 100;
  const totalEstimatedCost = baseLabourCost + platformFee;
  const costPerWorker = workersCount > 0 ? totalEstimatedCost / workersCount : 0;

  return {
    netDailyHoursPerWorker: Number(netDailyHoursPerWorker.toFixed(2)),
    totalWorkingHours: Number(totalWorkingHours.toFixed(2)),
    baseLabourCost: Number(baseLabourCost.toFixed(2)),
    costPerWorker: Number(costPerWorker.toFixed(2)),
    platformFee: Number(platformFee.toFixed(2)),
    totalEstimatedCost: Number(totalEstimatedCost.toFixed(2)),
    currency: 'SGD',
    disclaimer:
      'Calculations are estimates for budgeting purposes. Final payroll is determined by verified timesheets and statutory CPF requirements.',
  };
};

/**
 * Calculates shortage: Max(Required Headcount - Confirmed Staff, 0)
 */
export const calculateShortage = (
  requiredHeadcount: number,
  confirmedStaffCount: number
): { shortage: number; status: 'fully_staffed' | 'partially_staffed' | 'no_staff' } => {
  const shortage = Math.max(requiredHeadcount - confirmedStaffCount, 0);
  let status: 'fully_staffed' | 'partially_staffed' | 'no_staff' = 'no_staff';

  if (confirmedStaffCount >= requiredHeadcount) {
    status = 'fully_staffed';
  } else if (confirmedStaffCount > 0) {
    status = 'partially_staffed';
  } else {
    status = 'no_staff';
  }

  return { shortage, status };
};

const router = Router();

// GET /api/shiftmate/info
router.get('/info', (_req: Request, res: Response) => {
  res.status(200).json({
    app: 'ShiftMate',
    description: 'Smart Manpower Scheduling & Temporary Staff Hiring Platform',
    targetMarket: 'Singapore F&B and Retail SMEs',
    primaryStall: {
      company: 'ABC Food Pte Ltd',
      stall: 'ABC Chicken Rice (Tampines)',
      operatingHours: '09:00 - 21:00',
      location: 'Tampines Century Square #01-14, Singapore',
    },
    demoScenario: {
      date: '2026-10-15',
      shift: 'Service Crew 12:00–20:00',
      requiredHeadcount: 4,
      assignedPermanentStaff: 2,
      shortage: 2,
    },
  });
});

// POST /api/shiftmate/calculate-salary
router.post('/calculate-salary', (req: Request, res: Response) => {
  const { workersCount, hourlyRate, shiftHours, breakMinutes, workingDays, platformFeePercent } =
    req.body;

  if (!workersCount || !hourlyRate || !shiftHours || !workingDays) {
    res.status(400).json({
      error: 'Missing required fields: workersCount, hourlyRate, shiftHours, workingDays',
    });
    return;
  }

  const result = calculateLabourCost({
    workersCount: Number(workersCount),
    hourlyRate: Number(hourlyRate),
    shiftHours: Number(shiftHours),
    breakMinutes: breakMinutes ? Number(breakMinutes) : 45,
    workingDays: Number(workingDays),
    platformFeePercent: platformFeePercent ? Number(platformFeePercent) : 5,
  });

  res.status(200).json(result);
});

// POST /api/shiftmate/shortage-check
router.post('/shortage-check', (req: Request, res: Response) => {
  const { requiredHeadcount, confirmedStaffCount } = req.body;
  if (requiredHeadcount === undefined || confirmedStaffCount === undefined) {
    res.status(400).json({ error: 'Missing requiredHeadcount or confirmedStaffCount' });
    return;
  }

  const result = calculateShortage(Number(requiredHeadcount), Number(confirmedStaffCount));
  res.status(200).json(result);
});

export default router;
