import { Response, NextFunction } from "express";
import { UserService } from "../services/user.service.js";
import { ApiResponse, AuthRequest } from "../types/index.js";
import { z } from "zod";
import AuditService from "@/services/audit.service.js";
import { registerSchema } from "@/services/auth.service.js";

const toggleStatusSchema = z.object({
  isActive: z.boolean(),
});

export const getSalesExecutives = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { search, status, page, limit } = req.query;

    const result = await UserService.getSalesExecutives({
      search: typeof search === "string" ? search : undefined,
      status:
        status === "active" || status === "inactive" || status === "all"
          ? status
          : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    const response: ApiResponse = {
      success: true,
      message: "Sales executives retrieved successfully",
      data: result.executives,
      pagination: result.pagination,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getSalesExecutiveById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const executive = await UserService.getSalesExecutiveById(id);

    const response: ApiResponse = {
      success: true,
      message: "Sales executive details retrieved successfully",
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
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = toggleStatusSchema.parse(req.body);

    const result = await UserService.toggleExecutiveStatus(
      id,
      isActive,
      req.user?.id,
    );

    await AuditService.log({
      action: "UPDATE",
      entityType: "User",
      entityId: id,
      actorUserId: req.user?.id,
      ipAddress: req.ip || req.socket?.remoteAddress,
      newValue: { isActive },
    });

    const response: ApiResponse = {
      success: true,
      message: `Executive marked as ${isActive ? "active" : "inactive"} successfully`,
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password, role } = registerSchema.parse(req.body);

    const user = await UserService.createUser(
      { name, email, password, role },
      req.user?.id,
    );

    await AuditService.log({
      action: "CREATE",
      entityType: "User",
      entityId: user.id,
      actorUserId: req.user?.id,
      ipAddress: req.ip || req.socket?.remoteAddress,
      newValue: { name: user.name, email: user.email, role: user.role },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
