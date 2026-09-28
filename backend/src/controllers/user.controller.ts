import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import { ApiResponse, AuthRequest } from '../types/index.js';
import { z } from 'zod';

const toggleStatusSchema = z.object({
  isActive: z.boolean(),
});

export const getSalesExecutives = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, status } = req.query;

    const executives = await UserService.getSalesExecutives({
      search: typeof search === 'string' ? search : undefined,
      status:
        status === 'active' || status === 'inactive' || status === 'all'
          ? status
          : undefined,
    });

    const response: ApiResponse = {
      success: true,
      message: 'Sales executives retrieved successfully',
      data: executives,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getSalesExecutiveById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const executive = await UserService.getSalesExecutiveById(id);

    const response: ApiResponse = {
      success: true,
      message: 'Sales executive details retrieved successfully',
      data: executive,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const toggleExecutiveStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = toggleStatusSchema.parse(req.body);

    const result = await UserService.toggleExecutiveStatus(
      id,
      isActive,
      req.user?.id
    );

    const response: ApiResponse = {
      success: true,
      message: `Executive marked as ${isActive ? 'active' : 'inactive'} successfully`,
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
