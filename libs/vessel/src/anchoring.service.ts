import { Observation, RemoteEthereumAnchoringService } from './anchoring/remote-ethereum-anchoring-service';
import { Dispatcher } from './dispatcher';
import { CeramicDocumentId } from './ceramic-document-id';
import { Observable } from 'rxjs';
import { ILogger } from './logger/logger.interface';
import CID from 'cids';

export class AnchoringService {
  readonly #anchoring: RemoteEthereumAnchoringService
  readonly #dispatcher: Dispatcher
  readonly #logger: ILogger

  constructor(logger: ILogger, anchoring: RemoteEthereumAnchoringService, dispatcher: Dispatcher) {
    this.#logger = logger.withContext(AnchoringService.name)
    this.#anchoring = anchoring
    this.#dispatcher = dispatcher
  }

  async verify(record: any) {
    // TODO BOOKMARK
  }

  async originalRecordCid(anchorRecord: any) {
    const proofRecord = await this.#dispatcher.retrieveRecord(anchorRecord.proof)
    if (proofRecord.path.length === 0) {
      return proofRecord.root
    } else {
      const subPath: string = '/root/' + anchorRecord.path.substr(0, anchorRecord.path.lastIndexOf('/'))
      const last: string = anchorRecord.path.substr(anchorRecord.path.lastIndexOf('/')+1)
      //
      // prevRootPathRecord = await this.dispatcher.retrieveRecordByPath(anchorRecord.proof, subPath)
      // prevRootPathRecord = prevRootPathRecord[last]
    }
  }

  anchorStatus$(docId: CeramicDocumentId): Observable<Observation> {
    return this.#anchoring.anchorStatus$(docId)
  }

  requestAnchor(docId: CeramicDocumentId, cid: CID) {
    return this.#anchoring.requestAnchor(docId, cid)
  }
}
