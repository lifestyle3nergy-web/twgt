import { describe, it, expect } from 'vitest';
import { HealthService } from '@services/health/HealthService';

describe('HealthService', () => {
  it('reports a healthy status', () => {
    const health = new HealthService().getHealth();

    expect(health.status).toBe('healthy');
  });

  it('returns an ISO 8601 timestamp', () => {
    const { timestamp } = new HealthService().getHealth();

    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(Number.isNaN(Date.parse(timestamp))).toBe(false);
  });

  it('returns a non-negative numeric uptime', () => {
    const { uptime } = new HealthService().getHealth();

    expect(typeof uptime).toBe('number');
    expect(uptime).toBeGreaterThanOrEqual(0);
  });
});
