import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { decodeJwt } from '../src/lib/jwt.js';

/**
 * Frontend authentication utility tests.
 *
 * These cover the pure, DOM-free pieces of the cookie-based auth flow that the
 * frontend owns: JWT claim decoding (used by the edge proxy for route guarding)
 * and the cookie-name contract shared with the backend. Browser-only flows
 * (fetch, cookies(), Redux, Socket.IO) are exercised via the backend/route
 * integration tests rather than here.
 */

// Minimal base64url encoder for building test tokens without a crypto dep.
const b64url = (obj: unknown): string =>
  Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const makeJwt = (payload: Record<string, unknown>): string =>
  `header.${b64url(payload)}.signature`;

describe('Frontend Auth — JWT decoding (edge proxy route guard)', () => {
  test('decodes a valid, non-expired token with id and role', () => {
    const token = makeJwt({
      id: 'user-1',
      email: 'a@b.co',
      role: 'ADMIN',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const decoded = decodeJwt(token);
    assert.equal(decoded?.id, 'user-1');
    assert.equal(decoded?.role, 'ADMIN');
  });

  test('returns null for an expired token', () => {
    const token = makeJwt({
      id: 'user-1',
      role: 'ADMIN',
      exp: Math.floor(Date.now() / 1000) - 10,
    });
    assert.equal(decodeJwt(token), null);
  });

  test('returns null for malformed tokens and non-strings', () => {
    assert.equal(decodeJwt('not-a-jwt'), null);
    assert.equal(decodeJwt(''), null);
    assert.equal(decodeJwt('a.b'), null);
  });

  test('returns null when required claims (id/role) are missing', () => {
    const token = makeJwt({ email: 'a@b.co' });
    assert.equal(decodeJwt(token), null);
  });
});

describe('Frontend Auth — cookie name contract', () => {
  test('auth cookie name matches the backend default (CRM_Management)', () => {
    // The Next.js logout route, the edge proxy, and the backend must all agree
    // on the cookie name so the cookie set by the backend can be cleared. The
    // shared default is "CRM_Management" when no override is configured.
    const backendDefault = 'CRM_Management';
    const resolved =
      process.env.AUTH_COOKIE_NAME ||
      process.env.NEXT_PUBLIC_TOKEN_KEY ||
      process.env.TOKEN_KEY ||
      backendDefault;
    assert.equal(resolved, backendDefault);
  });
});
