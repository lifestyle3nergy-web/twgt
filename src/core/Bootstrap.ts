import { Application } from "@core/Application";

export class Bootstrap {
  private readonly application: Application;

  constructor() {
    this.application = new Application();
  }

  public async start(): Promise<void> {
    console.log("Bootstrapping TWGT platform...");

    await this.application.initialize();
    await this.application.start();

    console.log("TWGT platform is running.");
  }
}
