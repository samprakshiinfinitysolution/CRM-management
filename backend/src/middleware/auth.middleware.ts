import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { AppError } from './errorHandler.js';
import { UserRole, AuthRequest, AuthenticatedUser } from '../types/index.js';

import { prisma } from '../config/db.js';
import { CacheService } from '../services/cache.service.js';

/**
 * Authentication Middleware
 * Extracts and verifies JWT from Authorization Header or Cookie.
 * Validates session against Redis Cache with database fallback for zero-logout across deployments.
 * Attaches verified user context to req.user.
 */
export const authenticateUser = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies) {
    token = req.cookies[config.tokenKey] || req.cookies['token'];
  }

  if (!token) {
    return next(new AppError('Authentication token required', 401, 'UNAUTHORIZED'));
  }

  try {
    // 1. Check if token was explicitly revoked/blacklisted
    const isBlacklisted = await CacheService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return next(new AppError('Session has expired. Please log in again.', 401, 'TOKEN_REVOKED'));
    }

    // 2. Verify JWT signature against persistent secret
    const decoded = jwt.verify(token, config.jwt.secret) as AuthenticatedUser;

    // 3. Fast-path: Check persistent user session in Redis
    const cachedSession = await CacheService.getUserSession(decoded.id);

    if (cachedSession) {
      if (!cachedSession.isActive) {
        return next(new AppError('User account is deactivated', 403, 'ACCOUNT_DEACTIVATED'));
      }
      req.user = {
        id: cachedSession.id,
        email: cachedSession.email,
        name: cachedSession.name,
        role: cachedSession.role,
      };
      return next();
    }

    // 4. Fallback: Query PostgreSQL if cache missed (e.g. server restart/cold start)
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!dbUser || !dbUser.isActive) {
      return next(new AppError('User account not found or deactivated', 401, 'USER_INACTIVE'));
    }

    // 5. Re-warm Redis cache so subsequent requests are served in 0ms
    await CacheService.saveUserSession(dbUser.id, {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as unknown as UserRole,
      isActive: dbUser.isActive,
    });

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as UserRole,
    };

    next();
  } catch (_error) {
    return next(new AppError('Invalid or expired authentication token', 401, 'INVALID_TOKEN'));
  }
};

/**
 * RBAC Role Authorization Guard Middleware
 * Restricts endpoint access strictly to specified UserRoles.
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access restricted: requires role ${roles.join(' or ')}`,
          403,
          'FORBIDDEN_ROLE'
        )
      );
    }

    next();
  };
};
