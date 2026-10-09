import { z } from "zod";
import { UserRole } from "@/types/api.types";
import { getCookie, deleteCookie, setCookie } from "cookies-next";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Registration input validation schema
export const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    // phone: z.string().min(10, { message: "Phone must be at least 10 digits long" }),
    // branch: z.string().min(1, { message: "Branch is required" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(
        /[^A-Za-z0-9]/,
        { message: "Password must contain at least one special character" },
      ),
    confirmPassword: z
      .string()
      .min(6, { message: "Confirm password must be at least 6 characters long" }),
    role: z.nativeEnum(UserRole).default(UserRole.SALES_EXECUTIVE),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Create user input validation schema
export const createUserSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(
        /[^A-Za-z0-9]/,
        { message: "Password must contain at least one special character" },
      )
      .optional()
      .or(z.literal("")),
    role: z.enum([UserRole.ADMIN, UserRole.SALES_EXECUTIVE, UserRole.TEAM_LEADER]),
  })
  .strict();

// Login input validation schema
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

// Helper to safely get the environment key with fallback to CRM_Management
const getTokenKey = (): string =>
  process.env.NEXT_PUBLIC_TOKEN_KEY || "CRM_Management";

/**
 * Retrieves the authorization token from cookies or localStorage fallback.
 * Guarantees zero-logout persistence across deployments, restarts, and page reloads.
 * @returns The token string if found, otherwise empty string.
 */
export const getToken = (): string => {
  const tokenKey = getTokenKey();

  // 1. Check primary configured cookie
  const primaryToken = getCookie(tokenKey);
  if (typeof primaryToken === "string" && primaryToken.trim()) {
    return primaryToken.trim();
  }

  // 2. Check fallback cookie names
  const crmToken = getCookie("CRM_Management");
  if (typeof crmToken === "string" && crmToken.trim()) {
    return crmToken.trim();
  }

  const legacyToken = getCookie("token");
  if (typeof legacyToken === "string" && legacyToken.trim()) {
    return legacyToken.trim();
  }

  // 3. Resilient fallback: Check localStorage (survives any deployment / cookie clear)
  if (typeof window !== "undefined") {
    try {
      const stored =
        localStorage.getItem(tokenKey) ||
        localStorage.getItem("CRM_Management") ||
        localStorage.getItem("token");

      if (stored && typeof stored === "string" && stored.trim()) {
        const clean = stored.trim();
        // Automatically restore cookies so Next.js proxy/middleware & server components can read it
        setToken(clean);
        return clean;
      }
    } catch {
      // Ignore storage access restrictions in private modes
    }
  }

  return "";
};

/**
 * Persists the access token into both secure cookies and localStorage.
 * Ensures that even if cookies are reset during Vercel builds or server redeployments,
 * the authenticated user session remains intact.
 */
export const setToken = (token: string): void => {
  if (!token || typeof token !== "string" || !token.trim()) return;
  const clean = token.trim();
  const tokenKey = getTokenKey();

  const cookieOptions = {
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    sameSite: "lax" as const,
    secure:
      typeof window !== "undefined" && window.location.protocol === "https:",
  };

  // 1. Set configured token cookie
  setCookie(tokenKey, clean, cookieOptions);

  // 2. Set fallback cookie names for backward and cross-env compatibility
  if (tokenKey !== "CRM_Management") {
    setCookie("CRM_Management", clean, cookieOptions);
  }
  setCookie("token", clean, cookieOptions);

  // 3. Save to localStorage to survive deployments and edge proxy flushes
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(tokenKey, clean);
      localStorage.setItem("CRM_Management", clean);
      localStorage.setItem("token", clean);
    } catch {
      // Ignore storage restrictions
    }
  }
};

export const removeToken = (): void => {
  const tokenKey = getTokenKey();
  try {
    deleteCookie(tokenKey, { path: "/" });
    deleteCookie("CRM_Management", { path: "/" });
    deleteCookie("token", { path: "/" });
    deleteCookie("refreshToken", { path: "/" });
    deleteCookie("session", { path: "/" });

    if (typeof document !== "undefined") {
      document.cookie = `${tokenKey}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;`;
      document.cookie = `CRM_Management=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;`;
      document.cookie = `token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;`;
      document.cookie = `refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;`;
      document.cookie = `session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;`;
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem("CRM_Management");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        sessionStorage.clear();
      } catch {
        // Ignore storage access errors in private browsing modes
      }
    }
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

export const handleInvalidFields = (invalid: string[]) => {
  let message = "";
  invalid.forEach((field) => {
    message += `${field} is invalid\n`;
  });
  return message;
};

const handleDuplicateFields = (duplicate: string[]) => {
  let message = "";
  duplicate.forEach((field) => {
    message += `${field} is duplicate\n`;
  });
  return message;
};

const handleMissingFields = (missing: string[]) => {
  let message = "";
  missing.forEach((field) => {
    message += `${field} is missing\n`;
  });
  return message;
};

const fieldUtils = {
  handleInvalidFields,
  handleDuplicateFields,
  handleMissingFields,
};

export default fieldUtils;
