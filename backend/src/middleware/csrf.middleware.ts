import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';
import { isOriginAllowed } from '../config/allowedOrigins.js';

/**
 * CSRF defense-in-depth for state-changing (cookie-authenticated) endpoints.
 *
 * The application is served same-origin through the Next.js `/api` rewrite and
 * uses `SameSite=Lax` auth cookies, so a cross-site form POST cannot carry the
 * session cookie. This middleware adds an explicit Origin/Referer allow-list
 * check on top of that for the most sensitive auth actions (logout,
 * change-password, refresh) so a forged request is rejected even if a browser
 * or proxy ever relaxes cookie SameSite behavior.
 *
 * Safe for the same-origin rewrite: browsers omit `Origin`/`Referer` for some
 * same-origin GETs, but every state-changing method (POST/PUT/PATCH/DELETE)
 * always sends `Origin`. Requests with neither header (curl, server-to-server,
 * mobile) are allowed, matching the CORS policy for non-browser clients.
 */
const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const verifyOrigin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!STATE_CHANGING_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // Non-browser clients send no Origin/Referer — allowed (same as CORS policy).
  if (!origin && !referer) {
    return next();
  }

  // Prefer the Origin header; fall back to the Referer's origin.
  let requestOrigin = origin;
  if (!requestOrigin && referer) {
    try {
      requestOrigin = new URL(referer).origin;
    } catch {
      return next(new AppError('Invalid request origin', 403, 'FORBIDDEN_ORIGIN'));
    }
  }

  if (requestOrigin && !isOriginAllowed(requestOrigin)) {
    return next(
      new AppError('Request origin is not allowed', 403, 'FORBIDDEN_ORIGIN')
    );
  }

  return next();
};
