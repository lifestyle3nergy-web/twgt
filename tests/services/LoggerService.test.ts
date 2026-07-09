import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LoggerService, LogLevel } from '@services/LoggerService';

describe('LoggerService', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  const lastMessage = (): string => String(logSpy.mock.calls.at(-1)?.[0]);

  it('logs debug messages with the DEBUG level', () => {
    new LoggerService().debug('debug message');

    expect(lastMessage()).toContain(`[${LogLevel.DEBUG}]`);
    expect(lastMessage()).toContain('debug message');
  });

  it('logs info messages with the INFO level', () => {
    new LoggerService().info('info message');

    expect(lastMessage()).toContain(`[${LogLevel.INFO}]`);
    expect(lastMessage()).toContain('info message');
  });

  it('logs warnings with the WARN level', () => {
    new LoggerService().warn('warn message');

    expect(lastMessage()).toContain(`[${LogLevel.WARN}]`);
    expect(lastMessage()).toContain('warn message');
  });

  it('logs errors with the ERROR level', () => {
    new LoggerService().error('error message');

    expect(lastMessage()).toContain(`[${LogLevel.ERROR}]`);
    expect(lastMessage()).toContain('error message');
  });

  it('appends error details when an error is provided', () => {
    new LoggerService().error('failure', new Error('boom'));

    expect(lastMessage()).toContain('failure');
    expect(lastMessage()).toContain('boom');
  });

  it('uses the default service name TWGT', () => {
    new LoggerService().info('hello');

    expect(lastMessage()).toContain('[TWGT]');
  });

  it('uses a custom service name when provided', () => {
    new LoggerService('Custom').info('hello');

    expect(lastMessage()).toContain('[Custom]');
  });

  it('includes an ISO timestamp', () => {
    new LoggerService().info('hello');

    expect(lastMessage()).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
  });
});
