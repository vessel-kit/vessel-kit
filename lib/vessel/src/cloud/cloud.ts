import { Ipfs } from "ipfs";
import CID from "cids";
import { ILogger } from "../util/logger.interface";
import { CloudBus } from "./cloud-bus";

export class UnknownMessageError extends Error {
  constructor(message: any) {
    super(`Unknown message: ${JSON.stringify(message)}`);
  }
}

export class Cloud {
  #ipfs: Ipfs;
  #bus: CloudBus;

  constructor(logger: ILogger, ipfs: Ipfs) {
    this.#ipfs = ipfs;
    this.#bus = new CloudBus(logger, ipfs);
    this.#bus.listen();
  }

  get ipfs() {
    return this.#ipfs;
  }

  get bus() {
    return this.#bus;
  }

  store(content: any): Promise<CID> {
    return this.#ipfs.dag.put(content);
  }

  async retrieve(cid: CID, path?: string): Promise<any> {
    if (path) {
      const blob = await this.#ipfs.dag.get(cid, path);
      return blob?.value;
    } else {
      const blob = await this.#ipfs.dag.get(cid);
      return blob?.value;
    }
  }
}
