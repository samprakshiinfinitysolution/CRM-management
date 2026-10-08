import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateExecutiveMetrics, RawLeadForMetrics, RawFollowUpForMetrics } from '../src/utils/executiveMetrics.js';
import { LeadStatus, FollowUpStatus } from '../src/types/index.js';

describe('Executive Workload & KPI Metrics Calculation Engine', () => {
  test('calculates accurate conversion rate from total assigned and won leads', () => {
    const leads: RawLeadForMetrics[] = [
      { id: '1', status: LeadStatus.WON_SOLD, budget: 100000 },
      { id: '2', status: LeadStatus.WON_SOLD, budget: 50000 },
      { id: '3', status: LeadStatus.LOST, budget: 30000 },
      { id: '4', status: LeadStatus.IN_PROGRESS, budget: 40000 },
      { id: '5', status: LeadStatus.CONTACTED, budget: 20000 },
    ];

    const metrics = calculateExecutiveMetrics(leads, []);

    assert.equal(metrics.totalAssignedLeads, 5);
    assert.equal(metrics.convertedLeads, 2);
    assert.equal(metrics.lostLeads, 1);
    assert.equal(metrics.activeLeads, 2); // Only IN_PROGRESS & CONTACTED
    assert.equal(metrics.conversionRate, 40); // (2 / 5) * 100 = 40.0%
    assert.equal(metrics.totalPipelineValue, 210000); // Excludes LOST leads (100k + 50k + 40k + 20k)
  });

  test('correctly evaluates capacity thresholds and workload status', () => {
    // 10 active leads -> OPTIMAL (10 / 40 = 25%)
    const lightLeads: RawLeadForMetrics[] = Array.from({ length: 10 }, (_, i) => ({
      id: `lead-${i}`,
      status: LeadStatus.IN_PROGRESS,
    }));
    const lightMetrics = calculateExecutiveMetrics(lightLeads, []);
    assert.equal(lightMetrics.workloadStatus, 'OPTIMAL');
    assert.equal(lightMetrics.capacityPercentage, 25);

    // 28 active leads -> NEAR_CAPACITY (28 / 40 = 70%)
    const mediumLeads: RawLeadForMetrics[] = Array.from({ length: 28 }, (_, i) => ({
      id: `lead-${i}`,
      status: LeadStatus.CONTACTED,
    }));
    const mediumMetrics = calculateExecutiveMetrics(mediumLeads, []);
    assert.equal(mediumMetrics.workloadStatus, 'NEAR_CAPACITY');
    assert.equal(mediumMetrics.capacityPercentage, 70);

    // 38 active leads -> OVERLOADED (38 / 40 = 95%)
    const heavyLeads: RawLeadForMetrics[] = Array.from({ length: 38 }, (_, i) => ({
      id: `lead-${i}`,
      status: LeadStatus.NEW,
    }));
    const heavyMetrics = calculateExecutiveMetrics(heavyLeads, []);
    assert.equal(heavyMetrics.workloadStatus, 'OVERLOADED');
    assert.equal(heavyMetrics.capacityPercentage, 95);
  });

  test('identifies pending vs overdue follow-ups relative to given timestamp', () => {
    const fixedNow = new Date('2026-09-30T12:00:00Z');

    const followUps: RawFollowUpForMetrics[] = [
      { id: 'f1', status: FollowUpStatus.PENDING, scheduledAt: '2026-09-29T10:00:00Z' }, // Overdue
      { id: 'f2', status: FollowUpStatus.PENDING, scheduledAt: '2026-09-30T09:00:00Z' }, // Overdue
      { id: 'f3', status: FollowUpStatus.PENDING, scheduledAt: '2026-10-01T15:00:00Z' }, // Future
      { id: 'f4', status: FollowUpStatus.COMPLETED, scheduledAt: '2026-09-25T10:00:00Z' }, // Completed (not pending)
    ];

    const metrics = calculateExecutiveMetrics([], followUps, fixedNow);

    assert.equal(metrics.followUpsPending, 3);
    assert.equal(metrics.followUpsOverdue, 2);
  });

  test('returns clean zero state when leads and follow-ups are empty', () => {
    const metrics = calculateExecutiveMetrics([], []);

    assert.equal(metrics.totalAssignedLeads, 0);
    assert.equal(metrics.activeLeads, 0);
    assert.equal(metrics.convertedLeads, 0);
    assert.equal(metrics.lostLeads, 0);
    assert.equal(metrics.followUpsPending, 0);
    assert.equal(metrics.followUpsOverdue, 0);
    assert.equal(metrics.conversionRate, 0);
    assert.equal(metrics.capacityPercentage, 0);
    assert.equal(metrics.totalPipelineValue, 0);
    assert.equal(metrics.workloadStatus, 'OPTIMAL');
  });
});
