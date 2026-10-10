import { useLoginMutation, useRegisterMutation, useLogoutMutation, useGetMeQuery } from '@/store';
import { toast } from 'sonner';
import { getApiErrorMessage } from './errorHandler';
import { setManualLogoutActive } from './sessionGuard';

// Re-export RTK Query hooks for seamless backwards-compatibility
export {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
};

/**
 * Universal Error Parser
 * Handles RTK Query rejected responses, FetchBaseQueryErrors, and standard Error objects
 */
export const getAuthErrorMessage = (
  error: unknown,
  defaultMessage = 'Authentication failed. Please try again.'
): string => {
  return getApiErrorMessage(error, defaultMessage);
};

/**
 * Guards against duplicate/concurrent logout operations (e.g. double-click, or
 * multiple header/sidebar buttons firing at once). Module-level so it is shared
 * across every call site.
 */
let logoutInFlight = false;

/**
 * Universal Logout Handler
 *
 * Calls the same-origin `/api/auth/logout` route, which proxies to the backend
 * to invalidate the session (JWT blacklist + Redis session removal + audit) and
 * clears the httpOnly auth cookie. Regardless of whether the backend call
 * succeeds, local authenticated state is always purged (Redux user, RTK Query
 * cache, Socket.IO, app-owned storage) and the user is redirected.
 *
 * Honesty guarantee: if the backend could not be reached/invalidated, the user
 * is told the local sign-out succeeded but the server session may still be
 * valid — we never silently claim server-side revocation.
 */
export const performLogout = async (options?: {
  callBackend?: boolean;
  redirectTo?: string;
  delayMs?: number;
}) => {
  const { callBackend = true, redirectTo = '/', delayMs = 1000 } = options || {};

  // Prevent duplicate concurrent logouts.
  if (logoutInFlight) return;
  logoutInFlight = true;
  setManualLogoutActive(true);

  // Mark logging out in Redux immediately so any mounted components (like ProtectedRoute)
  // skip useGetMeQuery and suppress background network refetches.
  try {
    const { store } = await import('@/store/store');
    const { setLoggingOut } = await import('@/store/slices/authSlice');
    store.dispatch(setLoggingOut(true));
  } catch {
    // Non-fatal if store is unavailable
  }

  let backendInvalidated = false;

  try {
    if (callBackend) {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const body = (await res.json().catch(() => null)) as {
          backendInvalidated?: boolean;
        } | null;
        backendInvalidated = Boolean(body?.backendInvalidated);
      }
    } else {
      // Caller explicitly requested a local-only logout.
      backendInvalidated = false;
    }
  } catch (err) {
    // Network failure: proceed with local purge regardless.
    console.warn('Logout request failed, continuing local purge:', err);
  } finally {
    // Purge client-side auth-related storage (app-owned keys only).
    const { removeToken } = await import('@/lib/utils');
    removeToken();

    // Disconnect Socket.IO (removes the authenticated socket + its listeners).
    const { disconnectSocket } = await import('@/lib/socket');
    disconnectSocket();

    // Clear Redux auth state & the entire RTK Query cache so no user-specific
    // data can leak into the next session or after re-login.
    const { store } = await import('@/store/store');
    const { logout } = await import('@/store/slices/authSlice');
    const { crmApi } = await import('@/store/api/baseApi');

    store.dispatch(logout());
    store.dispatch(crmApi.util.resetApiState());

    // Honest user feedback.
    if (backendInvalidated) {
      toast.success('Signed out successfully.');
    } else {
      toast.warning(
        'You have been signed out on this device. If the server was unreachable, sign in again to fully revoke the session.',
      );
    }

    // Brief delay so the toast is visible before the hard redirect.
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    // Hard redirect purges Next.js App Router RSC memory cache and timers.
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = redirectTo;
    }

    logoutInFlight = false;
  }
};

const authService = {
  getAuthErrorMessage,
  performLogout,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
};

export default authService;