import { Response, NextFunction } from 'express';
import { LeadService } from '../services/lead.service.js';
import { NotificationService } from '../services/notification.service.js';
import { ApiResponse, AuthRequest, AssignLeadInput } from '../types/index.js';
import { emitToUser, createAndEmitNotification, WS_EVENTS } from '../config/socket.js';
import { getAuthUser } from '../utils/auth.helper.js';

export const getLeadsWithFilter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = getAuthUser(req);
    const { status, source, city, sortBy, page, limit, assignedToUserId, search, priority } =
      req.query;

    const result = await LeadService.getLeadWithFilter(
      user.id,
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
    const user = getAuthUser(req);

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
      user.id
    );

    // Emit real-time LEAD_ASSIGNED WebSocket event & persist notification for each assigned executive
    for (const allocation of result.allocations) {
      emitToUser(allocation.salesExecutiveId, WS_EVENTS.LEAD_ASSIGNED, {
        count: allocation.count,
        message: `${allocation.count} new lead(s) assigned to you!`,
        assignedByUserId: user.id,
      });

      await createAndEmitNotification({
        recipientUserId: allocation.salesExecutiveId,
        title: "New Leads Assigned",
        message: `${allocation.count} new lead(s) have been assigned to you.`,
        type: "ASSIGNMENT",
      });
    }

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
    const user = getAuthUser(req);
    const { id } = req.params;
    const lead = await LeadService.getLeadById(id, { id: user.id, role: user.role });

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
    const user = getAuthUser(req);
    const lead = await LeadService.createLead(req.body, user.id);

    // Reusable NotificationService resolves creator & emits notifications
    await NotificationService.notifyLeadCreated(lead, user);

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
    const user = getAuthUser(req);
    const { id } = req.params;
    const { status, note } = req.body;

    const updated = await LeadService.updateLeadStatus(id, status, note, user.id, user.role);

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
    const user = getAuthUser(req);
    const { leadIds, reason } = req.body;
    const result = await LeadService.recallLeads(leadIds, user.id, reason);

    // Reusable NotificationService handles previous assignee notifications
    await NotificationService.notifyLeadsRecalled({
      count: result.recalledCount,
      previousAssigneeMap: result.previousAssigneeMap || {},
      actorUserId: user.id,
      actorName: user.name,
      reason,
    });

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
    const user = getAuthUser(req);
    const { leadIds, targetExecutiveId, reason } = req.body;
    const result = await LeadService.reassignLeads(leadIds, targetExecutiveId, user.id, reason);

    // Reusable NotificationService handles target & previous assignee notifications
    await NotificationService.notifyLeadsReassigned({
      leadIds,
      targetExecutiveId,
      targetExecutiveName: result.targetExecutive,
      previousAssigneeMap: result.previousAssigneeMap || {},
      actorUserId: user.id,
      actorName: user.name,
      reason,
    });

    res.status(200).json({
      success: true,
      message: `Successfully reassigned ${result.reassignedCount} leads to ${result.targetExecutive}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};