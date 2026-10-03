import { AuthRequest, UserRole } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  email?: string;
  name?: string;
}

/**
 * Extracts and asserts the presence of the authenticated user from the request.
 * Throws 401 UNAUTHORIZED if not present.
 */
export const getAuthUser = (req: AuthRequest): AuthenticatedUser => {
  const user = req.user;
  if (!user || !user.id || !user.role) {
    throw new AppError('Authentication required to access this resource', 401, 'UNAUTHORIZED');
  }
  return user as AuthenticatedUser;
};

/**
 * Asserts the authenticated user has one of the required roles.
 * Throws 403 FORBIDDEN if the user role is not authorized.
 */
export const requireRole = (req: AuthRequest, allowedRoles: UserRole[]): AuthenticatedUser => {
  const user = getAuthUser(req);
  if (!allowedRoles.includes(user.role)) {
    throw new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN');
  }
  return user;
};
