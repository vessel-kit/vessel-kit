import { Cloud } from './cloud/cloud';
import { CeramicDocumentId } from '@potter/codec';
import { Observable } from 'rxjs';
import CID from 'cids';
import {
  AnchoringHttpClient,
  AnchorResponsePayloadType,
  BlockchainReader,
  IBlockchainReader,
  AnchorProof,
} from '@potter/anchoring';
import { RecordWrap } from '@potter/codec';
import { ConnectionString } from '@potter/blockchain-connection-string';

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

  anchorStatus$(docId: CeramicDocumentId): Observable<AnchorResponsePayloadType> {
    return this.#anchoring.anchorStatus$(docId);
  }

  requestAnchor(docId: CeramicDocumentId, cid: CID) {
    return this.#anchoring.requestAnchor(docId, cid);
  }
}
