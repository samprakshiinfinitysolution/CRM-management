import { UserRole } from '@/types/api.types';

export interface DecodedTokenPayload {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  exp?: number;
  iat?: number;
}

/**
 * Safely decodes a JWT token without external crypto dependencies.
 * Compatible with Edge Runtime, Node.js, and Browser environments.
 */
export const decodeJwt = (token: string): DecodedTokenPayload | null => {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    const jsonPayload =
      typeof atob === 'function'
        ? decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
        : Buffer.from(base64, 'base64').toString('utf-8');

    const payload = JSON.parse(jsonPayload);

    // Check expiration if exp claim is present (exp is in seconds)
    if (payload.exp && typeof payload.exp === 'number') {
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) return null;
    }

    if (!payload.role || !payload.id) return null;

    return payload as DecodedTokenPayload;
  } catch {
    return null;
  }
};
