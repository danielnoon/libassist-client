import express, { Express } from 'express';

export default class Server {
  private readonly path: string;
  private readonly port: number;
  private app: Express;

  constructor(path: string, port: number) {
    this.path = path;
    this.app = express();
    this.port = port;
  }

  start() {
    this.app.use(express.static(this.path));
    this.app.listen(this.port);
  }
}
