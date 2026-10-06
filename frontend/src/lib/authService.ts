import { useLoginMutation, useRegisterMutation, useLogoutMutation, useGetMeQuery } from '@/store';
import { toast } from 'sonner';
import { getApiErrorMessage } from './errorHandler';
import api from './api';

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
 * Universal Logout Handler
 * Uses POST /auth/logout endpoint to invalidate the session on the backend,
 * purges Next.js session cookies, clears client storage, Redux auth state, and RTK Query cache,
 * then cleanly navigates to the target redirection route.
 */
export const performLogout = async (options?: { callBackend?: boolean; redirectTo?: string; delayMs?: number }) => {
  const { callBackend = true, redirectTo = '/', delayMs = 2000 } = options || {};

  toast.success('Signed out successfully! Redirecting...');

  try {
    // 1. Call Backend /auth/logout endpoint to invalidate session, blacklist token, and clear httpOnly cookies
    if (callBackend) {
      await api.post("/auth/logout").catch((err) => {
        console.warn(
          "Backend /auth/logout request failed, continuing client purge:",
          err,
        );
      });
    }

    // 2. Call Next.js Server Route Handler to purge Next.js server-side cookies
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  } catch (err) {
    console.warn("Logout error, continuing local purge:", err);
  } finally {
    // 3. Purge client-side cookies and web storage
    const { removeToken } = await import("@/lib/utils");
    removeToken();

    // Disconnect Socket.IO
    const { disconnectSocket } = await import("@/lib/socket");
    disconnectSocket();

    // 4. Clear Redux state & RTK Query cache
    const { store } = await import("@/store/store");
    const { logout } = await import("@/store/slices/authSlice");
    const { crmApi } = await import("@/store/api/baseApi");

    store.dispatch(logout());
    store.dispatch(crmApi.util.resetApiState());

    // 5. User feedback delay
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    // 6. Hard window redirect to purge Next.js App Router RSC memory cache and background timers
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = redirectTo;
    }
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