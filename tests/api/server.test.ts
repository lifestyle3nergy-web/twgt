import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import http from 'node:http';
import net from 'node:net';

/**
 * Resolves once a TCP connection to the port succeeds (server accepting) or
 * rejects with ECONNREFUSED (port free). Used to assert real bind/release
 * behavior instead of relying on synchronous throws, which never happen for
 * asynchronous `listen()`/`close()`.
 */
const isPortAccepting = (port: number): Promise<boolean> =>
  new Promise((resolve, reject) => {
    const socket = net
      .connect({ port, host: '127.0.0.1' })
      .once('connect', () => {
        socket.destroy();
        resolve(true);
      })
      .once('error', (err: NodeJS.ErrnoException) => {
        socket.destroy();
        if (err.code === 'ECONNREFUSED') {
          resolve(false);
        } else {
          reject(err);
        }
      });
  });

const waitFor = async (
  predicate: () => Promise<boolean>,
  { attempts = 50, delayMs = 20 } = {},
): Promise<boolean> => {
  for (let i = 0; i < attempts; i += 1) {
    if (await predicate()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
};

const getJson = (
  port: number,
): Promise<{
  status: number;
  contentType: string | undefined;
  body: string;
}> =>
  new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:${port}`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () =>
          resolve({
            status: res.statusCode ?? 0,
            contentType: res.headers['content-type'],
            body: data,
          }),
        );
      })
      .on('error', reject);
  });

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
      // Wait for the async listen() to complete before issuing the request,
      // avoiding an intermittent ECONNREFUSED race on slow machines.
      expect(await waitFor(() => isPortAccepting(testPort))).toBe(true);

      const { status, contentType, body } = await getJson(testPort);
      expect(status).toBe(200);
      expect(contentType).toBe('application/json');

      const payload = JSON.parse(body);
      expect(payload.status).toBe('ok');
      expect(payload).toHaveProperty('application');
      expect(payload).toHaveProperty('version');
    } finally {
      server.stop();
    }
  });

  it('binds the port while running and releases it after stop()', async () => {
    const { Server } = await import('@api/server');
    const server = new Server();

    server.start();
    expect(await waitFor(() => isPortAccepting(testPort))).toBe(true);

    server.stop();
    expect(await waitFor(async () => !(await isPortAccepting(testPort)))).toBe(true);

    // Port is genuinely free, so a fresh server can bind and serve again.
    const reused = new Server();
    reused.start();
    try {
      expect(await waitFor(() => isPortAccepting(testPort))).toBe(true);
      const { status } = await getJson(testPort);
      expect(status).toBe(200);
    } finally {
      reused.stop();
    }
  });
});
