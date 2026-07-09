import type { Constructor } from "@types/Constructor";

export class ServiceRegistry {
  private readonly services = new Map<
    Constructor<unknown>,
    unknown
  >();

  /**
   * Register a service.
   */
  public register<T>(
    token: Constructor<T>,
    instance: T
  ): void {
    if (this.services.has(token)) {
      throw new Error(
        `Service "${token.name}" is already registered.`
      );
    }

    this.services.set(token, instance);
  }

  /**
   * Retrieve a service.
   */
  public get<T>(
    token: Constructor<T>
  ): T {
    const service = this.services.get(token);

    if (!service) {
      throw new Error(
        `Service "${token.name}" is not registered.`
      );
    }

    return service as T;
  }

  /**
   * Check service availability.
   */
  public has<T>(
    token: Constructor<T>
  ): boolean {
    return this.services.has(token);
  }

  /**
   * List registered services.
   */
  public list(): Constructor<unknown>[] {
    return Array.from(this.services.keys());
  }

  /**
   * Clear registry.
   */
  public clear(): void {
    this.services.clear();
  }
}
