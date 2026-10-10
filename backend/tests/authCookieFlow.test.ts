import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { config } from '../src/config/env.js';
import {
  getAuthCookieOptions,
  clearAuthCookieOptions,
} from '../src/config/authCookie.js';
import {
  getAllowedOrigins,
  isOriginAllowed,
  parseOrigins,
} from '../src/config/allowedOrigins.js';
import { verifyOrigin } from '../src/middleware/csrf.middleware.js';
import { logout } from '../src/controllers/auth.controller.js';
import { AppError } from '../src/middleware/errorHandler.js';
import AuditService from '../src/services/audit.service.js';
import { CacheService } from '../src/services/cache.service.js';

// ---------------------------------------------------------------------------
// Helpers: minimal Express req/res doubles (no live DB / Redis required).
// ---------------------------------------------------------------------------

interface MockResponse {
  statusCode: number;
  body: unknown;
  clearedCookies: Array<{ name: string; options: unknown }>;
  headers: Record<string, string>;
  status(code: number): MockResponse;
  json(payload: unknown): MockResponse;
  clearCookie(name: string, options: unknown): MockResponse;
  cookie(name: string, _value: string, options: unknown): MockResponse;
  setHeader(key: string, value: string): MockResponse;
}

const createRes = (): MockResponse => {
  const res: MockResponse = {
    statusCode: 200,
    body: undefined,
    clearedCookies: [],
    headers: {},
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.body = payload;
      return res;
    },
    clearCookie(name: string, options: unknown) {
      res.clearedCookies.push({ name, options });
      return res;
    },
    cookie() {
      return res;
    },
    setHeader(key: string, value: string) {
      res.headers[key] = value;
      return res;
    },
  };
  return res;
};

const signToken = (payload: Record<string, unknown>, expiresIn: string): string =>
  jwt.sign(payload, config.jwt.secret, { expiresIn } as jwt.SignOptions);

describe('Secure Cookie-Based Auth — Cookie Configuration', () => {
  test('auth cookie is httpOnly, path=/, and secure in production only', () => {
    const opts = getAuthCookieOptions();
    assert.equal(opts.httpOnly, true, 'auth cookie must be httpOnly');
    assert.equal(opts.path, '/', 'auth cookie path must be "/"');
    assert.equal(
      opts.secure,
      config.nodeEnv === 'production',
      'secure flag must mirror production environment',
    );
    // SameSite must NOT be "none" for the same-origin rewrite architecture.
    assert.equal(opts.sameSite, 'lax', 'same-origin rewrite uses SameSite=Lax');
  });

  test('clearCookie options match setCookie options (name/path/domain parity)', () => {
    const set = getAuthCookieOptions();
    const clear = clearAuthCookieOptions();

    // The attributes that determine whether a browser will actually delete the
    // cookie must be identical between set and clear.
    assert.equal(clear.path, set.path, 'path must match to delete the cookie');
    assert.equal(clear.sameSite, set.sameSite, 'sameSite must match');
    assert.equal(clear.secure, set.secure, 'secure must match');
    assert.equal(clear.httpOnly, set.httpOnly, 'httpOnly must match');
    if ('domain' in set) {
      assert.equal(clear.domain, set.domain, 'domain must match when present');
    }
  });
});

describe('Secure Cookie-Based Auth — Allowed Origins (CORS/CSRF source of truth)', () => {
  test('parseOrigins trims whitespace and strips trailing slashes', () => {
    const parsed = parseOrigins(' https://a.example.com/ , https://b.example.com/// ');
    assert.deepEqual(parsed, ['https://a.example.com', 'https://b.example.com']);
  });

  test('never returns a wildcard origin', () => {
    const origins = getAllowedOrigins();
    assert.equal(origins.has('*'), false, 'wildcard origin is forbidden with credentials');
  });

  test('isOriginAllowed tolerates trailing slashes and rejects unknown origins', () => {
    // Seed a known origin via env for a deterministic check.
    process.env.ALLOWED_ORIGINS = 'https://crm.example.com';
    try {
      assert.equal(isOriginAllowed('https://crm.example.com'), true);
      assert.equal(isOriginAllowed('https://crm.example.com/'), true);
      assert.equal(isOriginAllowed('https://evil.example.com'), false);
    } finally {
      delete process.env.ALLOWED_ORIGINS;
    }
  });
});

describe('Secure Cookie-Based Auth — CSRF verifyOrigin middleware', () => {
  const runVerify = (
    method: string,
    headers: Record<string, string | undefined>,
  ): { nextArg?: unknown } => {
    let nextArg: unknown;
    let called = false;
    const req = { method, headers } as never;
    const res = {} as never;
    const next = (err?: unknown) => {
      called = true;
      nextArg = err;
    };
    verifyOrigin(req, res, next);
    assert.ok(called, 'next() must be called');
    return { nextArg };
  };

  test('safe methods (GET) pass through without origin checks', () => {
    const { nextArg } = runVerify('GET', { origin: 'https://evil.example.com' });
    assert.equal(nextArg, undefined);
  });

  test('state-changing request with no Origin/Referer is allowed (non-browser)', () => {
    const { nextArg } = runVerify('POST', {});
    assert.equal(nextArg, undefined);
  });

  test('state-changing request from a disallowed Origin is rejected with 403', () => {
    process.env.ALLOWED_ORIGINS = 'https://crm.example.com';
    try {
      const { nextArg } = runVerify('POST', { origin: 'https://evil.example.com' });
      assert.ok(nextArg instanceof AppError, 'must reject with AppError');
      assert.equal((nextArg as AppError).statusCode, 403);
      assert.equal((nextArg as AppError).errorCode, 'FORBIDDEN_ORIGIN');
    } finally {
      delete process.env.ALLOWED_ORIGINS;
    }
  });

  test('state-changing request from an allowed Origin passes', () => {
    process.env.ALLOWED_ORIGINS = 'https://crm.example.com';
    try {
      const { nextArg } = runVerify('POST', { origin: 'https://crm.example.com' });
      assert.equal(nextArg, undefined);
    } finally {
      delete process.env.ALLOWED_ORIGINS;
    }
  });

  test('falls back to Referer origin when Origin header is absent', () => {
    process.env.ALLOWED_ORIGINS = 'https://crm.example.com';
    try {
      const ok = runVerify('POST', { referer: 'https://crm.example.com/dashboard' });
      assert.equal(ok.nextArg, undefined);
      const bad = runVerify('POST', { referer: 'https://evil.example.com/x' });
      assert.ok(bad.nextArg instanceof AppError);
    } finally {
      delete process.env.ALLOWED_ORIGINS;
    }
  });
});

describe('Secure Cookie-Based Auth — Logout controller', () => {
  // Stub the Redis/DB-touching collaborators so tests run without live services
  // and so we can assert the server-side invalidation actually happens.
  const calls = {
    invalidatedUsers: [] as string[],
    blacklisted: [] as Array<{ token: string; ttl: number }>,
    audits: [] as string[],
  };

  before(() => {
    AuditService.log = async (input: { action: string }) => {
      calls.audits.push(input.action);
    };
    CacheService.invalidateUserSession = async (userId: string) => {
      calls.invalidatedUsers.push(userId);
    };
    CacheService.blacklistToken = async (token: string, ttl: number) => {
      calls.blacklisted.push({ token, ttl });
    };
  });

  test('logout with no token still succeeds and clears the cookie (safe when unauthenticated)', async () => {
    const req = { headers: {}, cookies: {}, ip: '127.0.0.1' } as never;
    const res = createRes();
    let nextCalled = false;

    await logout(req, res as never, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false, 'no error should be thrown');
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, {
      success: true,
      message: 'User logged out successfully',
    });
    assert.equal(res.clearedCookies.length, 1, 'auth cookie must be cleared');
    assert.equal(res.clearedCookies[0].name, config.tokenKey);
    // No user to invalidate or audit when unauthenticated.
    assert.equal(calls.invalidatedUsers.length, 0);
    assert.equal(calls.blacklisted.length, 0);
    assert.equal(calls.audits.length, 0);
  });

  test('repeated logout requests are idempotent and always succeed', async () => {
    const req = { headers: {}, cookies: {}, ip: '127.0.0.1' } as never;

    for (let i = 0; i < 3; i++) {
      const res = createRes();
      await logout(req, res as never, (err?: unknown) => {
        throw err;
      });
      assert.equal(res.statusCode, 200);
      assert.equal(res.clearedCookies.length, 1);
    }
  });

  test('logout invalidates the server session, audits, and blacklists the token', async () => {
    const token = signToken({ id: 'user-abc', email: 'a@b.co', role: 'ADMIN' }, '10m');
    const req = {
      headers: {},
      cookies: { [config.tokenKey]: token },
      ip: '127.0.0.1',
    } as never;
    const res = createRes();

    await logout(req, res as never, (err?: unknown) => {
      throw err;
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.clearedCookies[0].name, config.tokenKey);
    // Clearing options must match creation options for the delete to take effect.
    const clearOpts = res.clearedCookies[0].options as Record<string, unknown>;
    assert.equal(clearOpts.path, '/');

    // Server-side revocation actually happened.
    assert.deepEqual(calls.invalidatedUsers, ['user-abc']);
    assert.equal(calls.audits.includes('LOGOUT'), true, 'LOGOUT audit recorded');
    assert.equal(calls.blacklisted.length, 1, 'token blacklisted');
    assert.equal(calls.blacklisted[0].token, token);
    // Blacklist TTL is bounded by the token's remaining lifetime (<= 10m here).
    assert.ok(calls.blacklisted[0].ttl > 0 && calls.blacklisted[0].ttl <= 600);
  });

  test('logout reads the token from the Authorization bearer header', async () => {
    const token = signToken({ id: 'user-456', email: 'c@d.co', role: 'TEAM_LEADER' }, '10m');
    const req = {
      headers: { authorization: `Bearer ${token}` },
      cookies: {},
      ip: '127.0.0.1',
    } as never;
    const res = createRes();

    await logout(req, res as never, (err?: unknown) => {
      throw err;
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.clearedCookies.length, 1);
    assert.ok(calls.blacklisted.some((b) => b.token === token));
  });
});

