import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfigurationService } from '@services/ConfigurationService';

describe('ConfigurationService', () => {
  const testKey = 'TWGT_CONFIG_TEST_KEY';
  const originalValue = process.env[testKey];

  beforeEach(() => {
    process.env[testKey] = 'test-value';
  });

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env[testKey];
    } else {
      process.env[testKey] = originalValue;
    }
  });

  it('loads environment variables on construction', () => {
    const config = new ConfigurationService();

    expect(config.get(testKey)).toBe('test-value');
  });

  it('returns undefined for unknown keys', () => {
    const config = new ConfigurationService();

    expect(config.get('TWGT_DEFINITELY_MISSING_KEY')).toBeUndefined();
  });

  it('require() returns the value when present', () => {
    const config = new ConfigurationService();

    expect(config.require(testKey)).toBe('test-value');
  });

  it('require() throws when the key is missing', () => {
    const config = new ConfigurationService();

    expect(() => config.require('TWGT_DEFINITELY_MISSING_KEY')).toThrowError(
      'Required configuration "TWGT_DEFINITELY_MISSING_KEY" is missing.',
    );
  });

  it('require() treats an empty-string value as missing', () => {
    process.env[testKey] = '';
    const config = new ConfigurationService();

    // Documents current behavior: has() sees the empty key but require()
    // rejects it because it uses a falsy check.
    expect(config.has(testKey)).toBe(true);
    expect(() => config.require(testKey)).toThrowError(
      `Required configuration "${testKey}" is missing.`,
    );
  });

  it('has() reflects key presence', () => {
    const config = new ConfigurationService();

    expect(config.has(testKey)).toBe(true);
    expect(config.has('TWGT_DEFINITELY_MISSING_KEY')).toBe(false);
  });

  it('keys() includes loaded environment keys', () => {
    const config = new ConfigurationService();

    expect(config.keys()).toContain(testKey);
  });
});
