import { Cloud } from './cloud/cloud';
import { DocId } from '@vessel-kit/codec';
import { Observable } from 'rxjs';
import CID from 'cids';
import {
  AnchoringHttpClient,
  AnchorResponsePayloadType,
  BlockchainReader,
  IBlockchainReader,
  AnchorProof,
} from '@vessel-kit/anchoring';
import { RecordWrap } from '@vessel-kit/codec';
import { ConnectionString } from '@vessel-kit/blockchain-connection-string';

export class AnchoringService {
  readonly #anchoring: AnchoringHttpClient;
  readonly #reader: IBlockchainReader;

  constructor(blockchainEndpoints: ConnectionString[], anchoring: AnchoringHttpClient, cloud: Cloud) {
    this.#anchoring = anchoring;
    this.#reader = BlockchainReader.build(cloud.ipfs, blockchainEndpoints);
  }

  async verify(anchorRecord: any, anchorRecordCid: CID): Promise<AnchorProof> {
    const wrap = new RecordWrap(anchorRecord, anchorRecordCid);
    return this.#reader.verify(wrap);
  }

  anchorStatus$(docId: DocId): Observable<AnchorResponsePayloadType> {
    return this.#anchoring.anchorStatus$(docId);
  }

  requestAnchor(docId: DocId, cid: CID) {
    return this.#anchoring.requestAnchor(docId, cid);
  }
}
