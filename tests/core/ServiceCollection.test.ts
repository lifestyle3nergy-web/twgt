import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from '@core/Container';
import { ServiceCollection } from '@core/ServiceCollection';

class ServiceA {}
class ServiceB {}
class ServiceC {}

describe('ServiceCollection', () => {
  let container: Container;
  let collection: ServiceCollection;

  beforeEach(() => {
    container = new Container();
    collection = new ServiceCollection(container);
  });

  it('registers a singleton and returns itself for chaining', () => {
    const instance = new ServiceA();
    const result = collection.addSingleton(ServiceA, instance);

    expect(result).toBe(collection);
    expect(container.resolve(ServiceA)).toBe(instance);
  });

  it('supports fluent chaining of multiple singletons', () => {
    const a = new ServiceA();
    const b = new ServiceB();

    collection.addSingleton(ServiceA, a).addSingleton(ServiceB, b);

    expect(container.resolve(ServiceA)).toBe(a);
    expect(container.resolve(ServiceB)).toBe(b);
  });

  it('registers multiple singletons via addSingletons()', () => {
    const a = new ServiceA();
    const b = new ServiceB();
    const c = new ServiceC();

    const result = collection.addSingletons([
      { token: ServiceA, instance: a },
      { token: ServiceB, instance: b },
      { token: ServiceC, instance: c },
    ]);

    expect(result).toBe(collection);
    expect(container.resolve(ServiceA)).toBe(a);
    expect(container.resolve(ServiceB)).toBe(b);
    expect(container.resolve(ServiceC)).toBe(c);
  });

  it('propagates duplicate registration errors from the container', () => {
    collection.addSingleton(ServiceA, new ServiceA());

    expect(() => collection.addSingleton(ServiceA, new ServiceA())).toThrowError(
      'Service "ServiceA" is already registered.',
    );
  });

  it('build() returns the underlying container', () => {
    expect(collection.build()).toBe(container);
  });
});
