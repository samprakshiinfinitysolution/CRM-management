import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getApiErrorMessage,
  getApiErrorCode,
  getApiErrorStatus,
} from '../src/lib/errorHandler.js';

describe('Frontend API Error Handling & Normalization Suite', () => {
  test('extracts message directly from standard ApiResponse envelope', () => {
    const error = {
      status: 400,
      data: {
        success: false,
        message: 'No unassigned leads available for distribution',
        error: {
          code: 'UNASSIGNED_POOL_EMPTY',
        },
      },
    };

    assert.equal(
      getApiErrorMessage(error),
      'No unassigned leads available for distribution'
    );
    assert.equal(getApiErrorCode(error), 'UNASSIGNED_POOL_EMPTY');
    assert.equal(getApiErrorStatus(error), 400);
  });

  test('formats array of validation details when message is absent', () => {
    const error = {
      status: 400,
      data: {
        error: {
          details: [
            { field: 'email', message: 'Invalid email address' },
            { field: 'password', message: 'Password must be at least 6 characters' },
          ],
        },
      },
    };

    const message = getApiErrorMessage(error);
    assert.equal(
      message,
      'email: Invalid email address; password: Password must be at least 6 characters'
    );
  });

  test('handles network failure (FETCH_ERROR) with clear actionable user guidance', () => {
    const networkError = {
      status: 'FETCH_ERROR',
      error: 'TypeError: Failed to fetch',
    };

    assert.equal(
      getApiErrorMessage(networkError),
      'Cannot reach the CRM server. Please ensure the backend is running and check your connection.'
    );
  });

  test('handles timeout errors gracefully', () => {
    const timeoutError = {
      code: 'ECONNABORTED',
      message: 'timeout of 10000ms exceeded',
    };

    assert.equal(
      getApiErrorMessage(timeoutError),
      'The request timed out. Please try again.'
    );
  });

  test('falls back to standard HTTP status messages when payload is blank', () => {
    assert.equal(
      getApiErrorMessage({ status: 401 }),
      'Session expired or unauthenticated. Please sign in again.'
    );
    assert.equal(
      getApiErrorMessage({ status: 403 }),
      'Access denied. You lack permissions for this operation.'
    );
    assert.equal(
      getApiErrorMessage({ status: 404 }),
      'The requested resource was not found.'
    );
    assert.equal(
      getApiErrorMessage({ status: 500 }),
      'Internal server error. Please try again later.'
    );
  });

  test('returns specified fallback message when error object is null or undefined', () => {
    assert.equal(getApiErrorMessage(null, 'Custom Fallback'), 'Custom Fallback');
    assert.equal(getApiErrorMessage(undefined), 'An unexpected error occurred');
  });
});
