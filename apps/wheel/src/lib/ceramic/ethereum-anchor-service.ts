import CID from 'cids';
import axios from 'axios';
import { CeramicDocumentId } from '@potter/vessel';

export class EthereumAnchorService {
  constructor(private readonly anchoringEndpoint: string) {}

  async requestAnchor(cid: CID) {
    const docId = new CeramicDocumentId(cid);
    const request = await axios.post(this.anchoringEndpoint, {
      docId: docId.toString(),
      cid: cid.toString(),
    });
  }
}
