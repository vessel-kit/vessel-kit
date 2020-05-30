import { Ipfs } from 'ipfs';
import CID from 'cids';

// TODO Rename to Cloud
export class Dispatcher {
  #ipfs: Ipfs
  constructor(ipfs: Ipfs) {
    this.#ipfs = ipfs
  }

  store(content: any): Promise<CID> {
    return this.#ipfs.dag.put(content)
  }

  async retrieve(cid: CID, path?: string) {
    const blob = await this.#ipfs.dag.get(cid, path)
    return blob?.value
  }
}
