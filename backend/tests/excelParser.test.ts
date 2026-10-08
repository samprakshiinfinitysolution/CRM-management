import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  matchFieldKey,
  sanitizePhoneNumber,
  isValidEmail,
  parsePriority,
  parseBudget,
} from '../src/utils/excelParser.js';
import { PriorityLevel } from '../src/types/index.js';

describe('Excel Parser & Data Transformation Utilities', () => {
  describe('Header Mapping & Alias Recognition', () => {
    test('matches diverse raw aliases to canonical internal field names', () => {
      assert.equal(matchFieldKey('Customer Name'), 'customerName');
      assert.equal(matchFieldKey('client_name'), 'customerName');
      assert.equal(matchFieldKey('Prospect Name'), 'customerName');
      assert.equal(matchFieldKey('Mobile Number'), 'mobile');
      assert.equal(matchFieldKey('WhatsApp'), 'mobile');
      assert.equal(matchFieldKey('Primary Phone'), 'mobile');
      assert.equal(matchFieldKey('Email Address'), 'email');
      assert.equal(matchFieldKey('Deal Value'), 'budget');
      assert.equal(matchFieldKey('Estimated Budget'), 'budget');
      assert.equal(matchFieldKey('City / State'), 'city');
      assert.equal(matchFieldKey('Lead Source'), 'leadSource');
      assert.equal(matchFieldKey('Priority Level'), 'priority');
    });

    test('returns null for unrecognized custom column headers', () => {
      assert.equal(matchFieldKey('Unknown Custom Metric'), null);
      assert.equal(matchFieldKey('Random ID 123'), null);
    });
  });

  describe('Phone Sanitization', () => {
    test('strips formatting symbols, parentheses, dots, spaces, and hyphens', () => {
      assert.equal(sanitizePhoneNumber('+91 98765-43210'), '+919876543210');
      assert.equal(sanitizePhoneNumber('(123) 456-7890'), '1234567890');
      assert.equal(sanitizePhoneNumber('98765.43210'), '9876543210');
      assert.equal(sanitizePhoneNumber('  9988776655  '), '9988776655');
    });

    test('handles empty and null values safely', () => {
      assert.equal(sanitizePhoneNumber(null), '');
      assert.equal(sanitizePhoneNumber(undefined), '');
      assert.equal(sanitizePhoneNumber(''), '');
    });
  });

  describe('Email Validation', () => {
    test('correctly validates valid email addresses', () => {
      assert.equal(isValidEmail('sales@leadflow.io'), true);
      assert.equal(isValidEmail('user.name+tag@example.co.uk'), true);
      assert.equal(isValidEmail('admin@domain.com'), true);
    });

    test('rejects invalid or malformed email strings', () => {
      assert.equal(isValidEmail('invalid-email'), false);
      assert.equal(isValidEmail('test@missing-domain'), false);
      assert.equal(isValidEmail('@nodomain.com'), false);
      assert.equal(isValidEmail(''), false);
    });
  });

  describe('Budget and Priority Parsing', () => {
    test('parses currency strings, formatted amounts, and numeric inputs to floats', () => {
      assert.equal(parseBudget('₹1,50,000'), 150000);
      assert.equal(parseBudget('$25,000.50'), 25000.5);
      assert.equal(parseBudget(85000), 85000);
      assert.equal(parseBudget(''), null);
      assert.equal(parseBudget('N/A'), null);
    });

    test('resolves priority level strings to PriorityLevel enum with proper default fallback', () => {
      assert.equal(parsePriority('URGENT'), PriorityLevel.URGENT);
      assert.equal(parsePriority('Critical'), PriorityLevel.URGENT);
      assert.equal(parsePriority('HIGH'), PriorityLevel.HIGH);
      assert.equal(parsePriority('LOW'), PriorityLevel.LOW);
      assert.equal(parsePriority('Medium'), PriorityLevel.MEDIUM);
      assert.equal(parsePriority(null), PriorityLevel.MEDIUM);
    });
  });
});
