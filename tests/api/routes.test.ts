import { describe, it, expect } from 'vitest';
import { healthRoute } from '@api/routes';
import { environment } from '@config/environment';

describe('healthRoute', () => {
  it('returns an ok status', () => {
    expect(healthRoute().status).toBe('ok');
  });

  it('includes the configured application name and version', () => {
    const response = healthRoute();

    expect(response.application).toBe(environment.appName);
    expect(response.version).toBe(environment.appVersion);
  });
});
