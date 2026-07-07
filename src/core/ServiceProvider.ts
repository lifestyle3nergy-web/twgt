import { Container } from "./Container";

export class ServiceProvider {
  constructor(private readonly container: Container) {}

  /**
   * Resolve a registered service.
   */
  public get<T>(key: string): T {
    return this.container.resolve<T>(key);
  }

  /**
   * Check whether a service is registered.
   */
  public has(key: string): boolean {
    return this.container.has(key);
  }
}
