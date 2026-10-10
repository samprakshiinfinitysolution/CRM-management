"use client";

import { toast } from "sonner";
import { removeToken } from "./utils";

/**
 * Centralized, idempotent handler for HTTP 401 (Unauthorized) responses.
 *
 * Both API clients (RTK Query `baseApi` and the Axios `api` instance) funnel
 * their 401s through `handleUnauthorized` so session-expiry behaviour is
 * identical everywhere and — critically — cannot cause a redirect/refresh loop.
 *
 * Guarantees:
 *  - Runs at most once per "logout episode". A module-level flag collapses
 *    concurrent/parallel 401s; a `sessionStorage` marker survives a full page
 *    reload so a half-cleared session cannot bounce the user back into the app.
 *  - Clears client tokens/cookies (`removeToken`) AND httpOnly cookies via the
 *    Next.js server route (`/api/auth/logout`), which client JS cannot delete.
 *  - Resets Redux auth state, RTK Query cache, and the realtime socket to stop
 *    any further authenticated requests that would 401 again.
 *  - Redirects to `/login` exactly once, and never while already on an auth page.
 *
 * Call {@link resetSessionGuard} after a successful login to re-arm the handler
 * for a future, genuine session expiry.
 */

const GUARD_KEY = "crm_unauthorized_guard";

// Auth endpoints where a 401 means "invalid credentials" (or an intentional
// logout / guest identity check), NOT an expired session — these must never trigger a forced logout toast.
const AUTH_BYPASS = ["/auth/login", "/auth/register", "/auth/logout", "/auth/me"];

// Collapses concurrent 401s within the current JS context.
let handling = false;

// Tracks intentional user logouts so session timeout warnings are suppressed.
let manualLogoutActive = false;

export const setManualLogoutActive = (active: boolean): void => {
  manualLogoutActive = active;
};

export const isManualLogoutActive = (): boolean => {
  return manualLogoutActive;
};

const isAuthPage = (): boolean => {
  if (typeof window === "undefined") return true;
  const path = window.location.pathname;
  return path === "/" || path.startsWith("/login") || path.startsWith("/register");
};

const readGuard = (): boolean => {
  try {
    return (
      typeof window !== "undefined" &&
      sessionStorage.getItem(GUARD_KEY) === "1"
    );
  } catch {
    return false;
  }
};

const writeGuard = (value: boolean): void => {
  try {
    if (typeof window === "undefined") return;
    if (value) {
      sessionStorage.setItem(GUARD_KEY, "1");
    } else {
      sessionStorage.removeItem(GUARD_KEY);
    }
  } catch {
    // Ignore storage access errors (e.g. private browsing modes)
  }
};

/**
 * Re-arm the 401 handler. MUST be called after a successful login/register so a
 * later genuine session expiry is still handled instead of being suppressed by
 * the persisted guard.
 */
export const resetSessionGuard = (): void => {
  handling = false;
  manualLogoutActive = false;
  writeGuard(false);
};

/**
 * Handle a 401 response from either API client.
 * @param endpoint The request URL/endpoint that returned 401 (used to bypass auth routes).
 */
export const handleUnauthorized = (endpoint?: string): void => {
  if (typeof window === "undefined") return;

  // Manual logout in progress: suppress session-expiry notification & duplicate redirect.
  if (manualLogoutActive) return;

  // 1. Never force a logout for auth endpoints (bad credentials, explicit logout, identity check).
  if (endpoint && AUTH_BYPASS.some((path) => endpoint.includes(path))) {
    return;
  }

  // 2. Idempotency: already handling, already handled before a reload, or on an
  //    auth page → do nothing. This is the core anti-loop protection.
  if (handling || readGuard() || isAuthPage()) return;

  handling = true;
  writeGuard(true);

  // 3. Clear client-side tokens/cookies immediately (best effort; httpOnly remain).
  removeToken();

  // 4. Clear httpOnly cookies via the Next.js server route. Client JS cannot
  //    delete httpOnly cookies, so this must be performed server-side.
  //    `keepalive` ensures the request completes even as the page navigates away.
  fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    keepalive: true,
  }).catch(() => {
    // Non-fatal: the client purge + redirect below still proceed.
  });

  // 5. Reset Redux auth state and RTK Query cache to halt authenticated refetches.
  void (async () => {
    try {
      const [{ store }, { logout }, { crmApi }] = await Promise.all([
        import("@/store/store"),
        import("@/store/slices/authSlice"),
        import("@/store/api/baseApi"),
      ]);
      store.dispatch(logout());
      store.dispatch(crmApi.util.resetApiState());
    } catch {
      // Store may be unavailable in some contexts; safe to ignore.
    }
  })();

  // 6. Disconnect the realtime socket (best effort) to stop socket-driven refetches.
  void (async () => {
    try {
      const { disconnectSocket } = await import("@/lib/socket");
      disconnectSocket();
    } catch {
      // ignore
    }
  })();

  // 7. Single user-facing notification + a single hard redirect to /login.
  toast.error("Your session has expired. Please sign in again.", {
    id: "session-expired",
  });
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = "/login";
};
