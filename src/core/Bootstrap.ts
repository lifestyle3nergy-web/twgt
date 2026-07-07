import { Application } from "@core/Application";
import { Server } from "@api/server";

export class Bootstrap {
  private readonly application: Application;
  private readonly server: Server;

  constructor() {
    this.application = new Application();
    this.server = new Server();
  }

  public async start(): Promise<void> {
    console.log("Bootstrapping TWGT platform...");

    await this.application.initialize();
    await this.application.start();

    this.server.start();

    console.log("TWGT platform is running.");
  }

  public async stop(): Promise<void> {
    this.server.stop();
    await this.application.stop();
  }
}
