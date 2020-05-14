import CID from 'cids';
import axios from 'axios'

export class EthereumAnchorService {
  constructor(private readonly anchoringEndpoint: string) {
  }

  async requestAnchor(cid: CID) {
    const request = await axios.post(this.anchoringEndpoint, {
      docId: cid.toString(),
      cid: cid.toString()
    })
    console.log('Done with anchoring', request.data)
  }
}
