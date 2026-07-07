export class Container {
  private readonly services = new Map<string, unknown>();

  /**
   * Register a singleton service.
   */
  public register<T>(key: string, instance: T): void {
    if (this.services.has(key)) {
      throw new Error(`Service "${key}" is already registered.`);
    }

    this.services.set(key, instance);
  }

  /**
   * Resolve a registered service.
   */
  public resolve<T>(key: string): T {
    const service = this.services.get(key);

    if (!service) {
      throw new Error(`Service "${key}" is not registered.`);
    }

    return service as T;
  }

  /**
   * Check if a service has been registered.
   */
  public has(key: string): boolean {
    return this.services.has(key);
  }

  /**
   * Remove a registered service.
   */
  public unregister(key: string): boolean {
    return this.services.delete(key);
  }

  /**
   * Remove all registered services.
   */
  public clear(): void {
    this.services.clear();
  }
}
