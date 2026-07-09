import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const ENV_KEYS = ['APP_NAME', 'APP_VERSION', 'NODE_ENV', 'PORT'] as const;

describe('environment', () => {
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

  it('falls back to default values when env vars are unset', async () => {
    const { environment } = await import('@config/environment');

    expect(environment.appName).toBe('TWGT');
    expect(environment.appVersion).toBe('0.2.0-alpha');
    expect(environment.nodeEnv).toBe('development');
    expect(environment.port).toBe(3000);
  });

  it('reads overrides from environment variables', async () => {
    process.env.APP_NAME = 'CustomApp';
    process.env.APP_VERSION = '9.9.9';
    process.env.NODE_ENV = 'production';
    process.env.PORT = '8080';

    const { environment } = await import('@config/environment');

    expect(environment.appName).toBe('CustomApp');
    expect(environment.appVersion).toBe('9.9.9');
    expect(environment.nodeEnv).toBe('production');
    expect(environment.port).toBe(8080);
  });

  it('coerces the port to a number', async () => {
    process.env.PORT = '4321';

    const { environment } = await import('@config/environment');

    expect(typeof environment.port).toBe('number');
    expect(environment.port).toBe(4321);
  });
});
