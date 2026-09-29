import { Response, NextFunction } from 'express';
import { LeadService } from '../services/lead.service.js';
import { ApiResponse, AuthRequest } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const getLeadsWithFilter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { status, source, city, sortBy, page, limit, assignedToUserId, search } =
      req.query;

    const result = await LeadService.getLeadWithFilter(
      userId,
      typeof status === 'string' && status !== 'ALL' ? status : undefined,
      typeof source === 'string' && source !== 'ALL' ? source : undefined,
      typeof city === 'string' ? city : undefined,
      typeof sortBy === 'string' ? sortBy : undefined,
      page ? Number(page) : 1,
      limit ? Number(limit) : 25,
      typeof assignedToUserId === 'string' ? assignedToUserId : undefined,
      typeof search === 'string' ? search : undefined
    );

    const response: ApiResponse = {
      success: true,
      message: 'Leads retrieved successfully',
      data: result.leads,
      pagination: result.pagination,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};