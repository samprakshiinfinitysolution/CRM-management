import { z } from "zod";
import { UserRole } from "@/types/api.types";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Registration input validation schema
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    // phone: z.string().min(10, "Phone must be at least 10 digits long"),
    // branch: z.string().min(1, "Branch is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters long"),
    role: z.nativeEnum(UserRole).default(UserRole.SALES_EXECUTIVE),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Login input validation schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Helper to safely get the environment key with fallback to CRM_Management
const getTokenKey = (): string =>
  process.env.NEXT_PUBLIC_TOKEN_KEY || "CRM_Management";

/**
 * Retrieves the authorization token cookie.
 * @returns The token string if found, otherwise empty string.
 */
export const getToken = (): string => {
  const tokenKey = getTokenKey();
  const token = getCookie(tokenKey);

  // Coerce token to string or return empty string if falsy/boolean
  return typeof token === "string" ? token : "";
};

/**
 * Sets the authorization token cookie using ONLY the configured NEXT_PUBLIC_TOKEN_KEY.
 * @param token The JWT or auth string to store.
 * @param days Expiration time in days (defaults to 7).
 */
export const setToken = (token: string, days = 7): void => {
  const tokenKey = getTokenKey();
  setCookie(tokenKey, token, {
    maxAge: 60 * 60 * 24 * days,
    path: "/", // Ensures the cookie is accessible across all site routes
    sameSite: "lax", // Basic security practice for auth tokens
  });
};

export const removeToken = (): void => {
  const tokenKey = getTokenKey();
  try {
    deleteCookie(tokenKey, { path: "/" });
    deleteCookie("token", { path: "/" });
    deleteCookie("refreshToken", { path: "/" });

    if (typeof document !== "undefined") {
      document.cookie = `${tokenKey}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;`;
      document.cookie = `token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;`;
      document.cookie = `refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;`;
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem("token");
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
