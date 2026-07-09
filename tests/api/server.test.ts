import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import http from 'node:http';

describe('Server', () => {
  const originalPort = process.env.PORT;
  const testPort = 34567;

  beforeEach(() => {
    process.env.PORT = String(testPort);
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    if (originalPort === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = originalPort;
    }
    vi.restoreAllMocks();
  });

  it('responds to requests with the health payload', async () => {
    const { Server } = await import('@api/server');
    const server = new Server();
    server.start();

    try {
      const body = await new Promise<string>((resolve, reject) => {
        http
          .get(`http://127.0.0.1:${testPort}`, (res) => {
            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toBe('application/json');
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve(data));
          })
          .on('error', reject);
      });

      const payload = JSON.parse(body);
      expect(payload.status).toBe('ok');
      expect(payload).toHaveProperty('application');
      expect(payload).toHaveProperty('version');
    } finally {
      server.stop();
    }
  });

  it('stops the server so the port is released', async () => {
    const { Server } = await import('@api/server');
    const server = new Server();
    server.start();
    server.stop();

    await new Promise((resolve) => setTimeout(resolve, 50));

    const reused = new Server();
    expect(() => reused.start()).not.toThrow();
    reused.stop();
  });
});
