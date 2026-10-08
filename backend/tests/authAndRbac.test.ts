import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { registerSchema, loginSchema } from '../src/services/auth.service.js';
import { UserRole } from '../src/types/index.js';
import { ZodError } from 'zod';

describe('Auth & RBAC Validation Suite', () => {
  describe('Registration Schema Validation', () => {
    test('accepts valid credentials with strong password and default/custom role', () => {
      const validPayload = {
        name: 'John Supervisor',
        email: 'john.supervisor@leadflow.io',
        password: 'Password@123',
        role: UserRole.TEAM_LEADER,
      };

      const result = registerSchema.parse(validPayload);
      assert.equal(result.name, 'John Supervisor');
      assert.equal(result.email, 'john.supervisor@leadflow.io');
      assert.equal(result.role, UserRole.TEAM_LEADER);
    });

    test('rejects weak passwords failing security constraints (missing uppercase, number, or special char)', () => {
      // Missing uppercase
      assert.throws(
        () =>
          registerSchema.parse({
            name: 'User',
            email: 'test@example.com',
            password: 'password@123',
          }),
        ZodError
      );

      // Missing number
      assert.throws(
        () =>
          registerSchema.parse({
            name: 'User',
            email: 'test@example.com',
            password: 'Password@abc',
          }),
        ZodError
      );

      // Too short (< 6 chars)
      assert.throws(
        () =>
          registerSchema.parse({
            name: 'User',
            email: 'test@example.com',
            password: 'Pa@1',
          }),
        ZodError
      );
    });

    test('rejects invalid email formats', () => {
      assert.throws(
        () =>
          registerSchema.parse({
            name: 'User',
            email: 'not-an-email',
            password: 'Password@123',
          }),
        ZodError
      );
    });
  });

  describe('Login Schema Validation', () => {
    test('validates correct login credentials', () => {
      const valid = loginSchema.parse({
        email: 'sarah.jenkins@leadflow.io',
        password: 'Password@123',
      });
      assert.equal(valid.email, 'sarah.jenkins@leadflow.io');
    });

    test('rejects missing or empty login fields', () => {
      assert.throws(() => loginSchema.parse({ email: '', password: '' }), ZodError);
    });
  });

  describe('Privilege Escalation Protection (SEC-01)', () => {
    test('AuthService.register rejects public registration with TEAM_LEADER role', async () => {
      const { AuthService } = await import('../src/services/auth.service.js');
      const { AppError } = await import('../src/middleware/errorHandler.js');

      await assert.rejects(
        async () => {
          await AuthService.register({
            name: 'Malicious Attacker',
            email: 'attacker@example.com',
            password: 'Password@123',
            role: UserRole.TEAM_LEADER,
          });
        },
        (err: any) => {
          assert.equal(err instanceof AppError, true);
          assert.equal(err.statusCode, 403);
          assert.equal(err.errorCode, 'FORBIDDEN_ROLE');
          return true;
        }
      );
    });
  });
});
