import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config/env.js";
import { UserRole } from "../types/index.js";
import { AppError } from "../middleware/errorHandler.js";
import { prisma } from "../config/db.js";
import { CacheService } from "./cache.service.js";

// Registration input validation schema
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
  role: z.nativeEnum(UserRole).default(UserRole.SALES_EXECUTIVE),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters long")
    .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
    .regex(/[a-z]/, "New password must contain at least one lowercase letter")
    .regex(/[0-9]/, "New password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "New password must contain at least one special character",
    ),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export class AuthService {
  static async register(input: RegisterInput) {
    const validatedData = registerSchema.parse(input);
    const normalizedEmail = validatedData.email.toLowerCase().trim();

    // Check duplicate user in PostgreSQL via Prisma
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new AppError("Email is already registered", 409, "DUPLICATE_EMAIL");
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    // Save user directly into the database
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: validatedData.role,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions,
    );

    // Save user session in Redis cache for fast auth & persistence across restarts
    await CacheService.saveUserSession(newUser.id, {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as unknown as UserRole,
      isActive: newUser.isActive,
    });

    return {
      user: newUser,
      token,
    };
  }
  static async login(input: LoginInput) {
    const validatedData = loginSchema.parse(input);
    const normalizedEmail = validatedData.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const passwordMatch = await bcrypt.compare(
      validatedData.password,
      user.passwordHash,
    );

    if (!passwordMatch) {
      throw new AppError("Invalid password", 401, "INVALID_PASSWORD");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions,
    );

    // Persist active session in Redis
    await CacheService.saveUserSession(user.id, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as unknown as UserRole,
      isActive: user.isActive,
    });

    return {
      user,
      token,
    };
  }

  static async changePassword(userId: string, input: ChangePasswordInput) {
    const validatedData = changePasswordSchema.parse(input);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        passwordHash: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const passwordMatch = await bcrypt.compare(
      validatedData.currentPassword,
      user.passwordHash,
    );

    if (!passwordMatch) {
      throw new AppError(
        "Incorrect current password",
        400,
        "INVALID_CURRENT_PASSWORD",
      );
    }

    if (validatedData.currentPassword === validatedData.newPassword) {
      throw new AppError(
        "New password cannot be the same as current password",
        400,
        "SAME_PASSWORD",
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Invalidate cached session so user must re-authenticate with new credentials
    await CacheService.invalidateUserSession(userId);

    return {
      succes: true,
      message: "Password changed successfully",
    };
  }
}
