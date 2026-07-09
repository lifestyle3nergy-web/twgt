import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Bootstrap } from '@core/Bootstrap';
import { Application } from '@core/Application';
import { Server } from '@api/server';

describe('Bootstrap', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(Server.prototype, 'start').mockImplementation(() => undefined);
    vi.spyOn(Server.prototype, 'stop').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('constructs without throwing', () => {
    expect(() => new Bootstrap()).not.toThrow();
  });

  it('starts the application and the server', async () => {
    const initSpy = vi.spyOn(Application.prototype, 'initialize');
    const startSpy = vi.spyOn(Application.prototype, 'start');
    const serverStartSpy = vi.spyOn(Server.prototype, 'start');

    await new Bootstrap().start();

    expect(initSpy).toHaveBeenCalledOnce();
    expect(startSpy).toHaveBeenCalledOnce();
    expect(serverStartSpy).toHaveBeenCalledOnce();
  });

  it('stops the server and the application', async () => {
    const stopSpy = vi.spyOn(Application.prototype, 'stop');
    const serverStopSpy = vi.spyOn(Server.prototype, 'stop');

    const bootstrap = new Bootstrap();
    await bootstrap.stop();

    expect(serverStopSpy).toHaveBeenCalledOnce();
    expect(stopSpy).toHaveBeenCalledOnce();
  });
});
