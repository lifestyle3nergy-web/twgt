import { describe, it, expect, beforeEach } from 'vitest';
import { ServiceRegistry } from '@services/ServiceRegistry';

class ServiceA {}
class ServiceB {}

describe('ServiceRegistry', () => {
  let registry: ServiceRegistry;

  beforeEach(() => {
    registry = new ServiceRegistry();
  });

  it('registers and retrieves a service', () => {
    const instance = new ServiceA();
    registry.register(ServiceA, instance);

    expect(registry.get(ServiceA)).toBe(instance);
  });

  it('throws when registering a duplicate token', () => {
    registry.register(ServiceA, new ServiceA());

    expect(() => registry.register(ServiceA, new ServiceA())).toThrowError(
      'Service "ServiceA" is already registered.',
    );
  });

  it('throws when retrieving an unregistered token', () => {
    expect(() => registry.get(ServiceB)).toThrowError('Service "ServiceB" is not registered.');
  });

  it('reports availability via has()', () => {
    expect(registry.has(ServiceA)).toBe(false);
    registry.register(ServiceA, new ServiceA());
    expect(registry.has(ServiceA)).toBe(true);
  });

  it('lists all registered tokens', () => {
    registry.register(ServiceA, new ServiceA());
    registry.register(ServiceB, new ServiceB());

    const tokens = registry.list();

    expect(tokens).toHaveLength(2);
    expect(tokens).toContain(ServiceA);
    expect(tokens).toContain(ServiceB);
  });

  it('clears all registered services', () => {
    registry.register(ServiceA, new ServiceA());
    registry.register(ServiceB, new ServiceB());

    registry.clear();

    expect(registry.list()).toHaveLength(0);
    expect(registry.has(ServiceA)).toBe(false);
  });
});
