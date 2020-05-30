import { ILogger } from './logger/logger.interface';
import { CeramicDocumentId } from './ceramic-document-id';
import CID from 'cids';
import { BehaviorSubject } from 'rxjs';
import { AnchoringStatus } from './anchoring/anchoring-status';
import { DocumentState } from './document.state';
import { UnreachableCaseError } from './unreachable-case.error';
import { Dispatcher } from './dispatcher';
import { Chain } from './chain';
import { NamedMutex } from './named-mutex.util';
import { AnchoringService } from './anchoring.service';
import { NotImplementedError } from './not-implemented.error';
import { RecordWrap } from './record-wrap';

export class DocumentService {
  #logger: ILogger
  #anchoring: AnchoringService
  #dispatcher: Dispatcher
  #mutex: NamedMutex

  constructor(logger: ILogger, anchoring: AnchoringService, dispatcher: Dispatcher) {
    this.#logger = logger.withContext(DocumentService.name)
    this.#anchoring = anchoring
    this.#dispatcher = dispatcher
    this.#mutex = new NamedMutex()
  }

  get anchoring() {
    return this.#anchoring
  }

  get dispatcher() {
    return this.#dispatcher
  }

  async tail(local: Chain, tip: CID, log: CID[] = []): Promise<Chain> {
    if (local.has(tip)) {
      return new Chain(log.reverse())
    } else {
      const record = await this.#dispatcher.retrieve(tip)
      const prev = record.prev as CID | null
      if (prev) {
        log.push(tip)
        return this.tail(local, prev, log)
      } else {
        return new Chain([])
      }
    }
  }

  async applyHead(recordCid: CID, state$: BehaviorSubject<DocumentState>) {
      this.#logger.debug(`Applying head ${recordCid.toString()}`)
      const localLog = state$.value.log
      const remoteLog = await this.tail(localLog, recordCid)
      // Case 1: Log is fully applied
      if (remoteLog.last.equals(localLog.last)) {
        this.#logger.debug(`Detected ${recordCid} is fully applied`)
      }
      // Case 2: Direct continuation
      const remoteStart = await this.#dispatcher.retrieve(remoteLog.init)
      if (remoteStart?.prev?.equals(localLog.last)) {
        this.#logger.debug(`Detected direct continuation for ${recordCid}`)
        await this.applyLog(remoteLog, state$)
      }
      // if (remoteLog[remoteLog.length -1]) {}
      // Case 3: Merge
  }

  async applyLog(log: Chain, state$: BehaviorSubject<DocumentState>) {
    for (let entry of log.log) {
      const content = await this.#dispatcher.retrieve(entry)
      const record = new RecordWrap(content, entry)
      switch (record.kind) {
        case RecordWrap.Kind.SIGNED:
          throw new NotImplementedError(`DocumentService.applyLog:SIGNED`)
        case RecordWrap.Kind.ANCHOR:
          const proof = await this.#anchoring.verify(content, entry)
          break
        case RecordWrap.Kind.GENESIS:
          throw new NotImplementedError(`DocumentService.applyLog:GENESIS`)
        default:
          throw new UnreachableCaseError(record.kind)
      }
    }
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
