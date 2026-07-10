import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const ENV_KEYS = ['APP_NAME', 'APP_VERSION'] as const;

describe('healthRoute', () => {
  const original: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      original[key] = process.env[key];
      delete process.env[key];
    }
    vi.resetModules();
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (original[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original[key];
      }
    }
  });

  it('returns an ok status', async () => {
    const { healthRoute } = await import('@api/routes');

    expect(healthRoute().status).toBe('ok');
  });

  it('returns the default application name and version when unset', async () => {
    const { healthRoute } = await import('@api/routes');
    const response = healthRoute();

    expect(response.application).toBe('TWGT');
    expect(response.version).toBe('0.2.0-alpha');
  });

  it('reflects application name and version from the environment', async () => {
    process.env.APP_NAME = 'CustomApp';
    process.env.APP_VERSION = '9.9.9';

    const { healthRoute } = await import('@api/routes');
    const response = healthRoute();

    expect(response.application).toBe('CustomApp');
    expect(response.version).toBe('9.9.9');
  });
});
