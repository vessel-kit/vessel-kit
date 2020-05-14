import { Ipfs } from 'ipfs';
import CID from 'cids';

export class FileStore {
  constructor(private readonly ipfs: Ipfs) {}

  async get(cid: string | CID, path?: string) {
    const blob = await this.ipfs.dag.get(cid, path);
    return blob.value;
  }

  async put(blob: any) {
    return this.ipfs.dag.put(blob);
  }
}
