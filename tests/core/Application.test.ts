import { describe, it, expect, vi, afterEach } from 'vitest';
import { Application } from '@core/Application';

describe('Application', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs the full lifecycle without throwing', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const app = new Application();

    await expect(app.initialize()).resolves.toBeUndefined();
    await expect(app.start()).resolves.toBeUndefined();
    await expect(app.stop()).resolves.toBeUndefined();
  });

  it('logs lifecycle messages', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const app = new Application();

    await app.initialize();
    await app.start();
    await app.stop();

    const messages = logSpy.mock.calls.map((call) => String(call[0]));
    expect(messages).toContain('Initializing TWGT platform...');
    expect(messages).toContain('Starting TWGT platform...');
    expect(messages).toContain('Stopping TWGT platform...');
  });
});
