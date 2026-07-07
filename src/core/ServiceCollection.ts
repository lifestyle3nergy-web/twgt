import { Container } from "./Container";

export class ServiceCollection {
  constructor(private readonly container: Container) {}

  /**
   * Register a singleton service instance.
   */
  public addSingleton<T>(key: string, instance: T): void {
    this.container.register(key, instance);
  }

  /**
   * Register multiple services.
   */
  public addServices(
    services: Array<{ key: string; instance: unknown }>
  ): void {
    for (const service of services) {
      this.container.register(service.key, service.instance);
    }
  }

  /**
   * Expose the configured container.
   */
  public build(): Container {
    return this.container;
  }
}
