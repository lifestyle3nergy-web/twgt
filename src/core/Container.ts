type Constructor<T> = new (...args: any[]) => T;

export class Container {
  private readonly services = new Map<Constructor<any>, unknown>();

  public register<T>(token: Constructor<T>, instance: T): void {
    if (this.services.has(token)) {
      throw new Error(`${token.name} is already registered.`);
    }

    this.services.set(token, instance);
  }

  public resolve<T>(token: Constructor<T>): T {
    const service = this.services.get(token);

    if (!service) {
      throw new Error(`${token.name} is not registered.`);
    }

    return service as T;
  }

  public has<T>(token: Constructor<T>): boolean {
    return this.services.has(token);
  }

  public unregister<T>(token: Constructor<T>): boolean {
    return this.services.delete(token);
  }

  public clear(): void {
    this.services.clear();
  }
    }
