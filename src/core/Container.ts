import type { Constructor } from "@types/Constructor";
// or "../types/Constructor" if path aliases are not configured

export class Container {
  private readonly services = new Map<Constructor<unknown>, unknown>();

  /**
   * Register a singleton service.
   */
  public register<T>(token: Constructor<T>, instance: T): void {
    if (this.services.has(token)) {
      throw new Error(`Service "${token.name}" is already registered.`);
    }

    this.services.set(token, instance);
  }

  /**
   * Resolve a registered service.
   */
  public resolve<T>(token: Constructor<T>): T {
    const service = this.services.get(token);

    if (!service) {
      throw new Error(`Service "${token.name}" is not registered.`);
    }

    return service as T;
  }

  /**
   * Check if a service is registered.
   */
  public has<T>(token: Constructor<T>): boolean {
    return this.services.has(token);
  }

  /**
   * Remove a service.
   */
  public unregister<T>(token: Constructor<T>): boolean {
    return this.services.delete(token);
  }

  /**
   * Remove all registered services.
   */
  public clear(): void {
    this.services.clear();
  }
}
