import { Response, NextFunction } from 'express';
import { LeadService } from '../services/lead.service.js';
import { ApiResponse, AuthRequest, AssignLeadInput } from '../types/index.js';
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

    const { status, source, city, sortBy, page, limit, assignedToUserId, search, priority } =
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
      typeof search === 'string' ? search : undefined,
      typeof priority === 'string' && priority !== 'ALL' ? priority : undefined
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

/**
 * Controller endpoint: POST /api/leads/assign (and POST /api/leads/distribute)
 * Executes atomic lead distribution/assignment in EQUAL, CUSTOM, or EXPLICIT modes.
 */
export const assignLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const {
      mode = 'EQUAL',
      leadIds,
      executiveIds,
      allocations,
      assignments,
      reason,
    } = req.body as AssignLeadInput;

    const result = await LeadService.assignLeads(
      {
        mode,
        leadIds,
        executiveIds,
        allocations,
        assignments,
        reason,
      },
      userId
    );

    const response: ApiResponse = {
      success: true,
      message: `Successfully assigned ${result.assignedCount} leads across ${result.allocations.length} executives`,
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId || !role) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const lead = await LeadService.getLeadById(id, { id: userId, role });

    res.status(200).json({
      success: true,
      message: 'Lead retrieved successfully',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const lead = await LeadService.createLead(req.body, userId);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLeadStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId || !role) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const { status, note } = req.body;

    const updated = await LeadService.updateLeadStatus(id, status, note, userId, role);

    res.status(200).json({
      success: true,
      message: 'Lead status updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const recallLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { leadIds, reason } = req.body;
    const result = await LeadService.recallLeads(leadIds, userId, reason);

    res.status(200).json({
      success: true,
      message: `Successfully recalled ${result.recalledCount} leads`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const reassignLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { leadIds, targetExecutiveId, reason } = req.body;
    const result = await LeadService.reassignLeads(leadIds, targetExecutiveId, userId, reason);

    res.status(200).json({
      success: true,
      message: `Successfully reassigned ${result.reassignedCount} leads to ${result.targetExecutive}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};