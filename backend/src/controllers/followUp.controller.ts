import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { FollowUpService } from '../services/followUp.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { ApiResponse, AuthRequest, LeadStatus } from '../types/index.js';

// ---------------------------------------------------------------------------
// Zod Validation Schemas
// ---------------------------------------------------------------------------

const FOLLOW_UP_TYPES = ['Call', 'Meeting', 'Email', 'WhatsApp'] as const;

const createFollowUpSchema = z.object({
  leadId: z.string().uuid({ message: 'leadId must be a valid UUID' }),
  scheduledAt: z
    .string()
    .datetime({ message: 'scheduledAt must be a valid ISO 8601 datetime' }),
  type: z.enum(FOLLOW_UP_TYPES, {
    errorMap: () => ({
      message: `type must be one of: ${FOLLOW_UP_TYPES.join(', ')}`,
    }),
  }),
  notes: z.string().max(2000, 'Notes exceed 2000 characters').optional(),
});

const completeFollowUpSchema = z.object({
  notes: z
    .string()
    .max(2000, 'Notes exceed 2000 characters')
    .optional(),
  nextStatus: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        Object.values(LeadStatus).includes(val as LeadStatus),
      { message: 'Invalid nextStatus value' }
    ),
  nextFollowUpAt: z
    .string()
    .datetime({ message: 'nextFollowUpAt must be a valid ISO 8601 datetime' })
    .optional(),
  nextFollowUpType: z.enum(FOLLOW_UP_TYPES).optional(),
});

const rescheduleFollowUpSchema = z.object({
  newScheduledAt: z
    .string()
    .datetime({ message: 'newScheduledAt must be a valid ISO 8601 datetime' }),
  newType: z.enum(FOLLOW_UP_TYPES).optional(),
  reason: z
    .string()
    .max(500, 'Reason exceeds 500 characters')
    .optional(),
});

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * GET /api/followups
 * Returns paginated follow-ups for the authenticated user, scoped by role.
 */
export const getFollowUps = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const {
      scope,
      leadId,
      executiveId,
      page,
      limit,
    } = req.query as Record<string, string>;

    const result = await FollowUpService.getFollowUps(userId, userRole, {
      scope: scope as any,
      leadId,
      executiveId,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 25,
    });

    const response: ApiResponse = {
      success: true,
      message: 'Follow-ups retrieved successfully',
      data: result.followUps,
      pagination: result.pagination,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/followups/summary
 * Returns aggregated counts — due today, upcoming, overdue, completed this month.
 */
export const getFollowUpSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const summary = await FollowUpService.getFollowUpSummary(userId, userRole);

    const response: ApiResponse = {
      success: true,
      message: 'Follow-up summary retrieved',
      data: summary,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/followups
 * Schedules a new follow-up task for a lead.
 */
export const createFollowUp = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const validated = createFollowUpSchema.parse(req.body);

    const followUp = await FollowUpService.createFollowUp(
      validated,
      userId,
      userRole
    );

    const response: ApiResponse = {
      success: true,
      message: 'Follow-up scheduled successfully',
      data: followUp,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/followups/:id/complete
 * Marks a follow-up as completed with optional outcome notes and lead status transition.
 */
export const completeFollowUp = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    if (!id) {
      throw new AppError('Follow-up ID is required', 400, 'MISSING_ID');
    }

    const validated = completeFollowUpSchema.parse(req.body);

    const updated = await FollowUpService.completeFollowUp(
      id,
      {
        notes: validated.notes,
        nextStatus: validated.nextStatus as LeadStatus | undefined,
        nextFollowUpAt: validated.nextFollowUpAt,
        nextFollowUpType: validated.nextFollowUpType,
      },
      userId,
      userRole
    );

    const response: ApiResponse = {
      success: true,
      message: 'Follow-up marked as completed',
      data: updated,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/followups/:id/reschedule
 * Reschedules a follow-up to a new date/time.
 */
export const rescheduleFollowUp = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    if (!id) {
      throw new AppError('Follow-up ID is required', 400, 'MISSING_ID');
    }

    const validated = rescheduleFollowUpSchema.parse(req.body);

    const newFollowUp = await FollowUpService.rescheduleFollowUp(
      id,
      {
        newScheduledAt: validated.newScheduledAt,
        newType: validated.newType,
        reason: validated.reason,
      },
      userId,
      userRole
    );

    const response: ApiResponse = {
      success: true,
      message: 'Follow-up rescheduled successfully',
      data: newFollowUp,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/followups/:id
 * Soft-deletes a follow-up (Regulation 4 — no hard deletion).
 */
export const deleteFollowUp = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    if (!id) {
      throw new AppError('Follow-up ID is required', 400, 'MISSING_ID');
    }

    await FollowUpService.deleteFollowUp(id, userId, userRole);

    const response: ApiResponse = {
      success: true,
      message: 'Follow-up deleted successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads/:leadId/followups
 * Retrieves all follow-ups for a specific lead (chronological timeline).
 */
export const getFollowUpsForLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { leadId } = req.params;
    if (!leadId) {
      throw new AppError('Lead ID is required', 400, 'MISSING_ID');
    }

    const followUps = await FollowUpService.getFollowUpsForLead(
      leadId,
      userId,
      userRole
    );

    const response: ApiResponse = {
      success: true,
      message: 'Lead follow-ups retrieved successfully',
      data: followUps,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
