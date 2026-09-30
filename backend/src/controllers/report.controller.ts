import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse, TLDashboardMetrics } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { ReportService } from '../services/report.service.js';

export const getTLDashboardMetrics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw new AppError('User not found or unauthenticated', 401, 'UNAUTHORIZED');
    }

    const metrics: TLDashboardMetrics = await ReportService.getTLDashboardMetrics(
      req.user.id
    );

    const response: ApiResponse<TLDashboardMetrics> = {
      success: true,
      message: 'Team Leader dashboard metrics fetched successfully',
      data: metrics,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getSEDashboardMetrics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw new AppError('User not found or unauthenticated', 401, 'UNAUTHORIZED');
    }

    const metrics = await ReportService.getSEDashboardMetrics(req.user.id);

    const response: ApiResponse = {
      success: true,
      message: 'Sales Executive dashboard metrics fetched successfully',
      data: metrics,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
