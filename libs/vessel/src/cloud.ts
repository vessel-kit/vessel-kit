import { Ipfs } from 'ipfs';
import CID from 'cids';

export class Cloud {
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
