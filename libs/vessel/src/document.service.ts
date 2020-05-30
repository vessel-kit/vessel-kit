import { ILogger } from './logger/logger.interface';
import { CeramicDocumentId } from './ceramic-document-id';
import CID from 'cids';
import { BehaviorSubject } from 'rxjs';
import { AnchoringStatus } from './anchoring/anchoring-status';
import { DocumentState } from './document.state';
import { UnreachableCaseError } from './unreachable-case.error';
import { Cloud } from './cloud';
import { NamedMutex } from './named-mutex.util';
import { AnchoringService } from './anchoring.service';
import { DocumentUpdateService } from './document-update.service';

export class DocumentService {
  #logger: ILogger
  #anchoring: AnchoringService
  #mutex: NamedMutex
  #updateService: DocumentUpdateService

  constructor(logger: ILogger, anchoring: AnchoringService, updateService: DocumentUpdateService) {
    this.#logger = logger.withContext(DocumentService.name)
    this.#anchoring = anchoring
    this.#mutex = new NamedMutex()
    this.#updateService = updateService
  }

  async applyHead(recordCid: CID, state$: BehaviorSubject<DocumentState>) {
    return this.#updateService.applyHead(recordCid, state$)
  }

  handleAnchorStatusUpdate(docId: CeramicDocumentId, state$: BehaviorSubject<DocumentState>) {
    return this.#anchoring.anchorStatus$(docId).subscribe(async observation => {
      await this.#mutex.use(docId.toString(), async () => {
        this.#logger.debug(`Received anchoring update for ${docId.toString()}`, observation)
        switch (observation.status) {
          case AnchoringStatus.ANCHORED:
            const anchorRecordCID = observation.anchorRecord
            return this.applyHead(anchorRecordCID, state$)
          case AnchoringStatus.PENDING:
            return state$.next({
              ...state$.value,
              anchor: {
                status: AnchoringStatus.PENDING,
                scheduledAt: observation.scheduledAt
              }
            })
          case AnchoringStatus.PROCESSING:
            return state$.next({
              ...state$.value,
              anchor: {
                status: AnchoringStatus.PROCESSING,
              }
            })
          default:
            throw new UnreachableCaseError(observation)
        }
      })
    })
  }

  requestAnchor(docId: CeramicDocumentId, cid: CID) {
    this.#logger.debug(`Requesting anchor for ${docId.toString()}?version=${cid.toString()}`)
    this.#anchoring.requestAnchor(docId, cid)
  }
}
