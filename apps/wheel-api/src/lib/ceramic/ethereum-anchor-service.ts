import CID from 'cids';
import axios from 'axios';
import { CeramicDocumentId } from '@potter/codec';

export class EthereumAnchorService {
  constructor(private readonly anchoringEndpoint: string) {}

  async requestAnchor(cid: CID) {
    const docId = new CeramicDocumentId(cid);
    const request = await axios.post(this.anchoringEndpoint, {
      docId: docId.toString(),
      cid: cid.toString(),
    });
  }

  async lastRecord(cid: CID | string) {
    const request = await axios.get(`${this.anchoringEndpoint}/${cid.toString()}?latest=true`);
    return request.data;
  }

  async listRequest(cid: CID | string) {
    const request = await axios.get(`${this.anchoringEndpoint}/list/${cid.toString()}`);
    return request.data;
  }
}
