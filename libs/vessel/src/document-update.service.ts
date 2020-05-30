import { Cloud } from './cloud';
import { Chain } from './chain';
import CID from 'cids';
import { BehaviorSubject } from 'rxjs';
import { DocumentState } from './document.state';
import { ILogger } from './logger/logger.interface';
import { RecordWrap } from './record-wrap';
import { NotImplementedError } from './not-implemented.error';
import { UnreachableCaseError } from './unreachable-case.error';
import { AnchoringService } from './anchoring.service';
import { HandlersContainer } from './handlers/handlers.container';

export class DocumentUpdateService {
  #cloud: Cloud
  #logger: ILogger
  #anchoring: AnchoringService
  #handlers: HandlersContainer

  constructor(logger: ILogger, handlers: HandlersContainer, anchoring: AnchoringService, cloud: Cloud) {
    this.#logger = logger.withContext(DocumentUpdateService.name)
    this.#cloud = cloud
    this.#anchoring = anchoring
    this.#handlers = handlers
  }

  async tail(local: Chain, tip: CID, log: CID[] = []): Promise<Chain> {
    if (local.has(tip)) {
      return new Chain(log.reverse())
    } else {
      const record = await this.#cloud.retrieve(tip)
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
    const remoteStart = await this.#cloud.retrieve(remoteLog.init)
    if (remoteStart?.prev?.equals(localLog.last)) {
      this.#logger.debug(`Detected direct continuation for ${recordCid}`)
      await this.applyLog(remoteLog, state$)
    }
    // if (remoteLog[remoteLog.length -1]) {}
    // Case 3: Merge
  }

  async applyLog(log: Chain, state$: BehaviorSubject<DocumentState>) {
    for (let entry of log.log) {
      const content = await this.#cloud.retrieve(entry)
      const record = new RecordWrap(content, entry)
      switch (record.kind) {
        case RecordWrap.Kind.SIGNED:
          throw new NotImplementedError(`DocumentService.applyLog:SIGNED`)
        case RecordWrap.Kind.ANCHOR:
          const proof = await this.#anchoring.verify(content, entry)
          // Get handler, call applyAnchor
          break
        case RecordWrap.Kind.GENESIS:
          throw new NotImplementedError(`DocumentService.applyLog:GENESIS`)
        default:
          throw new UnreachableCaseError(record.kind)
      }
    }
  }
}
