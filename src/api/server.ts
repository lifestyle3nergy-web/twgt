import http from "node:http";
import { healthRoute } from "./routes";
import { environment } from "@config/environment";

export class Server {
  private server = http.createServer((_req, res) => {
    try {
      const body = JSON.stringify(healthRoute());

      res.writeHead(200, {
        "Content-Type": "application/json",
      });

      res.end(body);
    } catch (error) {
      console.error("Failed to handle request.", error);

      if (!res.headersSent) {
        res.writeHead(500, {
          "Content-Type": "application/json",
        });
      }

      res.end(JSON.stringify({ status: "error" }));
    }
  });

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      const onStartupError = (error: Error): void => {
        this.server.removeListener("listening", onListening);
        reject(error);
      };

      const onListening = (): void => {
        this.server.removeListener("error", onStartupError);

        this.server.on("error", (error: Error) => {
          console.error("Server error.", error);
        });

        console.log(
          `${environment.appName} listening on port ${environment.port}`
        );

        resolve();
      };

      this.server.once("error", onStartupError);
      this.server.once("listening", onListening);

      this.server.listen(environment.port);
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((error?: Error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}
