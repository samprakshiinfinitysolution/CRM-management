import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { AppError } from './errorHandler.js';
import { UserRole, AuthRequest, AuthenticatedUser } from '../types/index.js';

/**
 * Authentication Middleware
 * Extracts and verifies JWT from Authorization Header or Cookie.
 * Attaches verified user context to req.user.
 */
export const authenticateUser = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
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
    const decoded = jwt.verify(token, config.jwt.secret) as AuthenticatedUser;
    req.user = decoded;
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
