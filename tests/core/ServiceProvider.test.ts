import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from '@core/Container';
import { ServiceProvider } from '@core/ServiceProvider';

class ServiceA {}
class ServiceB {}

describe('ServiceProvider', () => {
  let container: Container;
  let provider: ServiceProvider;

  beforeEach(() => {
    container = new Container();
    provider = new ServiceProvider(container);
  });

  it('resolves a registered service via get()', () => {
    const instance = new ServiceA();
    container.register(ServiceA, instance);

    expect(provider.get(ServiceA)).toBe(instance);
  });

  it('throws when getting an unregistered service', () => {
    expect(() => provider.get(ServiceB)).toThrowError('Service "ServiceB" is not registered.');
  });

  it('reports availability via has()', () => {
    expect(provider.has(ServiceA)).toBe(false);
    container.register(ServiceA, new ServiceA());
    expect(provider.has(ServiceA)).toBe(true);
  });
});
