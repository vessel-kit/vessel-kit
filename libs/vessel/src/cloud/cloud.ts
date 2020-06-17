import { Ipfs } from 'ipfs';
import CID from 'cids';
import { ILogger } from '../logger/logger.interface';
import { CloudBus } from './cloud-bus';

export class UnknownMessageError extends Error {
  constructor(message: any) {
    super(`Unknown message: ${JSON.stringify(message)}`);
  }
}

export class Cloud {
  #ipfs: Ipfs
  #logger: ILogger
  #bus: CloudBus

  constructor(logger: ILogger, ipfs: Ipfs) {
    this.#logger = logger;
    this.#ipfs = ipfs
    this.#bus = new CloudBus(logger, ipfs)
    this.#bus.listen()
  }

  get message$() {
    return this.bus.message$
  }

  get bus() {
    return this.#bus
  }

  store(content: any): Promise<CID> {
    return this.#ipfs.dag.put(content)
  }

  async retrieve(cid: CID, path?: string) {
    const blob = await this.#ipfs.dag.get(cid, path)
    return blob?.value
  }
}
