import { Request, Response, Router } from 'express';

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  service: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
  timezone: string;
}

export const getHealthData = (): HealthResponse => {
  return {
    status: 'healthy',
    service: 'ShiftMate – Smart Manpower Scheduling & Temporary Staff Hiring Platform',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }),
    timezone: 'Asia/Singapore (UTC+8)',
  };
};

/**
 * Express handler for /api/health
 */
export const healthHandler = (req: Request, res: Response) => {
  const data = getHealthData();
  res.status(200).json(data);
};

const router = Router();
router.get('/', healthHandler);

export default router;
