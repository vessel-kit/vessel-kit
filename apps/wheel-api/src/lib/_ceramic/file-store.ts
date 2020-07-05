import { Ipfs } from 'ipfs';
import CID from 'cids';
import { ContentStorage } from '../../storage/content.storage';

export class FileStore {
  constructor(
    private readonly ipfs: Ipfs,
    private readonly contentStorage: ContentStorage,
  ) {}

  async get(cid: string | CID, path?: string) {
    const found = await this.contentStorage.byId(cid);
    if (found) {
      return found.payload;
    } else {
      const blob = await this.ipfs.dag.get(cid, path);
      await this.contentStorage.put(cid, blob.value);
      return blob.value;
    }
  }

  async put(blob: any) {
    const cid = await this.ipfs.dag.put(blob);
    await this.contentStorage.put(cid, blob);
    return cid;
  }
}
