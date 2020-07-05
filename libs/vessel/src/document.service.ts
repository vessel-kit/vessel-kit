import { ILogger } from './logger/logger.interface';
import { CeramicDocumentId } from './ceramic-document-id';
import CID from 'cids';
import { AnchoringStatus } from '@potter/anchoring';
import { DocumentState } from './document.state';
import { UnreachableCaseError } from './unreachable-case.error';
import { Cloud } from './cloud/cloud';
import { NamedMutex } from './named-mutex.util';
import { AnchoringService } from './anchoring.service';
import { DocumentUpdateService } from './document-update.service';
import { FrozenSubject } from './frozen-subject';
import { RecordWrap } from './record-wrap';
import { normalizeRecord } from './normalize-record.util';
import { MessageTyp } from './cloud/message-typ';
import { filter } from 'rxjs/operators';

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

  handleUpdate(docId: CeramicDocumentId, state: DocumentState) {
    if (!docId.cid.equals(state.log.last)) {
      this.#cloud.bus.publishHead(docId, state.log.last)
    }
  }

  handleAnchorStatusUpdate(docId: CeramicDocumentId, state$: FrozenSubject<DocumentState>) {
    return this.#anchoring.anchorStatus$(docId).subscribe(async observation => {
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
          case AnchoringStatus.FAILED:
            return state$.next({
              ...state$.value,
              anchor: {
                status: AnchoringStatus.FAILED,
              }
            })
          default:
            throw new UnreachableCaseError(observation)
        }
    })
  }

  async update(record: any, state$: FrozenSubject<DocumentState>) {
    const cid = await this.#cloud.store(normalizeRecord(record))
    const recordWrap = new RecordWrap(record, cid)
    const next = await this.#updateService.applyUpdate(recordWrap, state$.value)
    const documentId = new CeramicDocumentId(state$.value.log.first)
    this.#anchoring.requestAnchor(documentId, cid)
    state$.next(next)
  }

  requestAnchor(docId: CeramicDocumentId, cid: CID) {
    this.#logger.debug(`Requesting anchor for ${docId.toString()}?version=${cid.toString()}`)
    this.#anchoring.requestAnchor(docId, cid)
  }

  requestUpdates(docId: CeramicDocumentId, state$: FrozenSubject<DocumentState>) {
    this.#logger.debug(`Requesting updates for ${docId}`)
    this.#cloud.bus.request(docId.toString())
    this.#cloud.bus.message$.pipe(filter(message => message.id === docId.toString())).subscribe(async message => {
      if (message.typ === MessageTyp.RESPONSE || message.typ === MessageTyp.UPDATE) {
        await this.applyHead(message.cid, state$)
      }
    })
  }
}