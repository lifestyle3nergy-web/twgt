import http from "node:http";
import { healthRoute } from "./routes";
import { environment } from "@config/environment";

export class Server {
  private server = http.createServer((_req, res) => {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(healthRoute()));
  });

  public start(): void {
    this.server.listen(environment.port, () => {
      console.log(
        `${environment.appName} listening on port ${environment.port}`
      );
    });
  }

  public stop(): void {
    this.server.close();
  }
}
