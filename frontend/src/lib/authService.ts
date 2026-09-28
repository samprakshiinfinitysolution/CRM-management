import { useLoginMutation, useRegisterMutation, useLogoutMutation, useGetMeQuery } from '@/store';
import { toast } from 'sonner';

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
  if (!error) return defaultMessage;

  // RTK Query FetchBaseQueryError shape
  if (typeof error === 'object' && error !== null) {
    const errObj = error as {
      status?: number | string;
      data?: {
        message?: string;
        error?: { code?: string; message?: string; details?: unknown };
      };
      error?: string;
      message?: string;
    };

    if (errObj.data?.message) {
      return errObj.data.message;
    }
    if (errObj.data?.error?.message) {
      return errObj.data.error.message;
    }
    if (errObj.data?.error?.code) {
      return `Error: ${errObj.data.error.code}`;
    }
    if (typeof errObj.error === 'string') {
      return errObj.error;
    }
    if (typeof errObj.message === 'string') {
      return errObj.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
};

/**
 * Universal Logout Handler
 * Guarantees atomic purge of cookies, Local/SessionStorage, Redux Auth state, and RTK Query cache,
 * followed by a 2-second user feedback delay and a clean full-page navigation.
 */
export const performLogout = async (options?: { callBackend?: boolean; redirectTo?: string; delayMs?: number }) => {
  const { callBackend = true, redirectTo = '/', delayMs = 2000 } = options || {};

  toast.success('Signed out successfully! Redirecting...');

  try {
    // 1. Call Next.js Server Route Handler to purge Next.js server-side cookies
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});

    // 2. Call Express Backend to purge backend httpOnly cookies
    if (callBackend) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiBaseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('Backend logout request failed, continuing client purge:', err);
  } finally {
    // 3. Purge client-side cookies and web storage
    const { removeToken } = await import('@/lib/utils');
    removeToken();

    // 4. Clear Redux state & RTK Query cache
    const { store } = await import('@/store/store');
    const { logout } = await import('@/store/slices/authSlice');
    const { crmApi } = await import('@/store/api/baseApi');

    store.dispatch(logout());
    store.dispatch(crmApi.util.resetApiState());

    // 5. Signout redirection takes 2 seconds
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    // 6. Hard window redirect to purge Next.js App Router RSC memory cache and background timers
    if (typeof window !== 'undefined') {
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