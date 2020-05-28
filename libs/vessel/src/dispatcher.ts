import { Ipfs } from 'ipfs';
import CID from 'cids';

// TODO Rename to Cloud
export class Dispatcher {
  #ipfs: Ipfs
  constructor(ipfs: Ipfs) {
    this.#ipfs = ipfs
  }

  storeRecord(record: any): Promise<CID> {
    return this.#ipfs.dag.put(record)
  }

  async retrieveRecord(cid: CID) {
    const blob = await this.#ipfs.dag.get(cid)
    return blob.value
  }
}
