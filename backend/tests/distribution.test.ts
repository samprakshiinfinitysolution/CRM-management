import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { LeadService } from '../src/services/lead.service.js';
import { AppError } from '../src/middleware/errorHandler.js';

describe('Lead Distribution Engine — Business Logic & Edge Cases', () => {
  describe('EQUAL Distribution Mode', () => {
    test('distributes evenly when lead count is perfectly divisible by executive count', () => {
      const leadIds = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'];
      const executiveIds = ['E1', 'E2'];

      const result = LeadService.distributeEqually(leadIds, executiveIds);

      assert.equal(result.length, 10);
      const e1Leads = result.filter((r) => r.salesExecutiveId === 'E1');
      const e2Leads = result.filter((r) => r.salesExecutiveId === 'E2');

      assert.equal(e1Leads.length, 5);
      assert.equal(e2Leads.length, 5);
      // Ensure all leads are uniquely assigned
      const assignedLeadIds = new Set(result.map((r) => r.leadId));
      assert.equal(assignedLeadIds.size, 10);
    });

    test('distributes remainders deterministically to first N executives (10 leads / 3 executives -> 4, 3, 3)', () => {
      const leadIds = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'];
      const executiveIds = ['E1', 'E2', 'E3'];

      const result = LeadService.distributeEqually(leadIds, executiveIds);

      assert.equal(result.length, 10);
      const e1Leads = result.filter((r) => r.salesExecutiveId === 'E1');
      const e2Leads = result.filter((r) => r.salesExecutiveId === 'E2');
      const e3Leads = result.filter((r) => r.salesExecutiveId === 'E3');

      assert.equal(e1Leads.length, 4);
      assert.equal(e2Leads.length, 3);
      assert.equal(e3Leads.length, 3);
    });

    test('distributes remainders deterministically (11 leads / 3 executives -> 4, 4, 3)', () => {
      const leadIds = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11'];
      const executiveIds = ['E1', 'E2', 'E3'];

      const result = LeadService.distributeEqually(leadIds, executiveIds);

      assert.equal(result.length, 11);
      const e1Leads = result.filter((r) => r.salesExecutiveId === 'E1');
      const e2Leads = result.filter((r) => r.salesExecutiveId === 'E2');
      const e3Leads = result.filter((r) => r.salesExecutiveId === 'E3');

      assert.equal(e1Leads.length, 4);
      assert.equal(e2Leads.length, 4);
      assert.equal(e3Leads.length, 3);
    });

    test('handles boundary case: 1 lead across 5 executives -> E1 gets 1, others get 0', () => {
      const leadIds = ['L1'];
      const executiveIds = ['E1', 'E2', 'E3', 'E4', 'E5'];

      const result = LeadService.distributeEqually(leadIds, executiveIds);

      assert.equal(result.length, 1);
      assert.equal(result[0].leadId, 'L1');
      assert.equal(result[0].salesExecutiveId, 'E1');
    });

    test('throws AppError when lead pool is empty (0 leads)', () => {
      assert.throws(
        () => LeadService.distributeEqually([], ['E1', 'E2']),
        (err: any) => err instanceof AppError && err.errorCode === 'NO_LEADS_AVAILABLE'
      );
    });

    test('throws AppError when executive list is empty (0 executives)', () => {
      assert.throws(
        () => LeadService.distributeEqually(['L1', 'L2'], []),
        (err: any) => err instanceof AppError && err.errorCode === 'NO_EXECUTIVES_SELECTED'
      );
    });
  });

  describe('CUSTOM Distribution Mode', () => {
    test('allocates exact specified quotas to respective executives', () => {
      const leadIds = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'];
      const allocations = [
        { salesExecutiveId: 'E1', count: 5 },
        { salesExecutiveId: 'E2', count: 3 },
        { salesExecutiveId: 'E3', count: 2 },
      ];

      const result = LeadService.distributeCustom(leadIds, allocations);

      assert.equal(result.length, 10);
      assert.equal(result.filter((r) => r.salesExecutiveId === 'E1').length, 5);
      assert.equal(result.filter((r) => r.salesExecutiveId === 'E2').length, 3);
      assert.equal(result.filter((r) => r.salesExecutiveId === 'E3').length, 2);

      // Verify no duplicate assignments
      const assignedLeadIds = new Set(result.map((r) => r.leadId));
      assert.equal(assignedLeadIds.size, 10);
    });

    test('throws AppError when total requested quota exceeds available lead count', () => {
      const leadIds = ['L1', 'L2', 'L3'];
      const allocations = [
        { salesExecutiveId: 'E1', count: 2 },
        { salesExecutiveId: 'E2', count: 3 }, // Total requested = 5 > 3
      ];

      assert.throws(
        () => LeadService.distributeCustom(leadIds, allocations),
        (err: any) => err instanceof AppError && err.errorCode === 'INSUFFICIENT_LEADS'
      );
    });

    test('throws AppError when total allocated quota is zero or negative', () => {
      const leadIds = ['L1', 'L2', 'L3'];
      const allocations = [
        { salesExecutiveId: 'E1', count: 0 },
        { salesExecutiveId: 'E2', count: 0 },
      ];

      assert.throws(
        () => LeadService.distributeCustom(leadIds, allocations),
        (err: any) => err instanceof AppError && err.errorCode === 'INVALID_QUOTA_COUNT'
      );
    });

    test('throws AppError when allocations array is empty', () => {
      const leadIds = ['L1', 'L2', 'L3'];

      assert.throws(
        () => LeadService.distributeCustom(leadIds, []),
        (err: any) => err instanceof AppError && err.errorCode === 'NO_ALLOCATIONS_PROVIDED'
      );
    });
  });
});
