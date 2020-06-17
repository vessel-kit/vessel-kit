import { ILogger } from './logger/logger.interface';
import { CeramicDocumentId } from './ceramic-document-id';
import CID from 'cids';
import { AnchoringStatus } from './anchoring/anchoring-status';
import { DocumentState } from './document.state';
import { UnreachableCaseError } from './unreachable-case.error';
import { Cloud } from './cloud';
import { NamedMutex } from './named-mutex.util';
import { AnchoringService } from './anchoring.service';
import { DocumentUpdateService } from './document-update.service';
import { FrozenSubject } from './frozen-subject';
import { RecordWrap } from './record-wrap';
import { normalizeRecord } from './normalize-record.util';

export class DocumentService {
  #logger: ILogger
  #anchoring: AnchoringService
  #mutex: NamedMutex
  #updateService: DocumentUpdateService
  #cloud: Cloud

  constructor(logger: ILogger, anchoring: AnchoringService, cloud: Cloud, updateService: DocumentUpdateService) {
    this.#logger = logger.withContext(DocumentService.name)
    this.#anchoring = anchoring
    this.#mutex = new NamedMutex()
    this.#updateService = updateService
    this.#cloud = cloud
  }

  async applyHead(recordCid: CID, state$: FrozenSubject<DocumentState>) {
    const nextState = await this.#updateService.applyHead(recordCid, state$.value)
    if (nextState) {
      state$.next(nextState)
    }
  }

  handleAnchorStatusUpdate(docId: CeramicDocumentId, state$: FrozenSubject<DocumentState>) {
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

  async update(record: any, state$: FrozenSubject<DocumentState>) {
    const cid = await this.#cloud.store(normalizeRecord(record))
    const recordWrap = new RecordWrap(record, cid)
    const next = await this.#updateService.applyUpdate(recordWrap, state$.value)
    const documentId = new CeramicDocumentId(state$.value.log.first)
    this.#anchoring.requestAnchor(documentId, cid)
    state$.next(next)
    this.#cloud.publishHead(documentId.toString(), cid)
  }

  requestAnchor(docId: CeramicDocumentId, cid: CID) {
    this.#logger.debug(`Requesting anchor for ${docId.toString()}?version=${cid.toString()}`)
    this.#anchoring.requestAnchor(docId, cid)
  }
}
