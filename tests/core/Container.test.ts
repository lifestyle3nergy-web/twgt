import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from '@core/Container';

class ServiceA {
  public readonly name = 'A';
}

class ServiceB {
  public readonly name = 'B';
}

describe('Container', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  it('registers and resolves a singleton instance', () => {
    const instance = new ServiceA();
    container.register(ServiceA, instance);

    expect(container.resolve(ServiceA)).toBe(instance);
  });

  it('reports registration state via has()', () => {
    expect(container.has(ServiceA)).toBe(false);
    container.register(ServiceA, new ServiceA());
    expect(container.has(ServiceA)).toBe(true);
  });

  it('throws when registering the same token twice', () => {
    container.register(ServiceA, new ServiceA());

    expect(() => container.register(ServiceA, new ServiceA())).toThrowError(
      'Service "ServiceA" is already registered.',
    );
  });

  it('throws when resolving an unregistered token', () => {
    expect(() => container.resolve(ServiceB)).toThrowError('Service "ServiceB" is not registered.');
  });

  it('unregisters a service and returns whether it existed', () => {
    container.register(ServiceA, new ServiceA());

    expect(container.unregister(ServiceA)).toBe(true);
    expect(container.has(ServiceA)).toBe(false);
    expect(container.unregister(ServiceA)).toBe(false);
  });

  it('clears all registered services', () => {
    container.register(ServiceA, new ServiceA());
    container.register(ServiceB, new ServiceB());

    container.clear();

    expect(container.has(ServiceA)).toBe(false);
    expect(container.has(ServiceB)).toBe(false);
  });

  it('keeps distinct instances per token', () => {
    const a = new ServiceA();
    const b = new ServiceB();
    container.register(ServiceA, a);
    container.register(ServiceB, b);

    expect(container.resolve(ServiceA)).toBe(a);
    expect(container.resolve(ServiceB)).toBe(b);
  });
});
