import type { CookieOptions } from "express";
import { config } from "./env.js";

/** Browser requests reach the backend through the same-origin Next.js /api rewrite. */
export const getAuthCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "lax",
  path: "/",
  maxAge: config.redis.sessionTtlSeconds * 1000,
});

export const clearAuthCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "lax",
  path: "/",
});
