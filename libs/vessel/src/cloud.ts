import { Ipfs } from 'ipfs';
import CID from 'cids';
import { queueScheduler } from 'rxjs';
import { ILogger } from './logger/logger.interface';

const TOPIC = '/ceramic';

export enum MessageTyp {
  UPDATE,
  REQUEST,
  RESPONSE,
}

export class Cloud {
  #ipfs: Ipfs
  #logger: ILogger

  constructor(logger: ILogger, ipfs: Ipfs) {
    this.#logger = logger;
    this.#ipfs = ipfs
  }

  store(content: any): Promise<CID> {
    return this.#ipfs.dag.put(content)
  }

  publishHead (id: string, head: CID): void {
    queueScheduler.schedule(async () => {
      const message = { typ: MessageTyp.UPDATE, id, cid: head.toString() }
      this.#logger.debug(`Publishing head`, message)
      await this.#ipfs.pubsub.publish(TOPIC, JSON.stringify(message))
    })
  }

  async retrieve(cid: CID, path?: string) {
    const blob = await this.#ipfs.dag.get(cid, path)
    return blob?.value
  }
}
