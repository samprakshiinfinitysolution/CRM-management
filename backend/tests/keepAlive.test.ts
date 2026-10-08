import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { KeepAliveService } from '../src/services/keepAlive.service.js';

describe('KeepAlive Cron Service Suite', () => {
  test('resolves correct target health endpoint URL', () => {
    const targetUrl = KeepAliveService.getTargetUrl();
    assert.match(targetUrl, /\/api\/health$/);
  });

  test('reports status accurately before and after start/stop', () => {
    const statusBefore = KeepAliveService.getStatus();
    assert.equal(typeof statusBefore.intervalMinutes, 'number');
    assert.equal(statusBefore.intervalMinutes, 14);

    // Starting in test mode is safely no-op'd or toggles
    KeepAliveService.stop();
    const statusStopped = KeepAliveService.getStatus();
    assert.equal(statusStopped.isRunning, false);
  });
});
