import { Cloud } from './cloud';
import { Chain } from './chain';
import CID from 'cids';
import { DocumentState } from './document.state';
import { ILogger } from './logger/logger.interface';
import { RecordWrap } from './record-wrap';
import { NotImplementedError } from './not-implemented.error';
import { UnreachableCaseError } from './unreachable-case.error';
import { AnchoringService } from './anchoring.service';
import { HandlersContainer } from './handlers/handlers.container';
import { CeramicDocumentId } from './ceramic-document-id';

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
        const nextLog = log.concat(tip)
        return this.tail(local, prev, nextLog)
      } else {
        return new Chain([])
      }
    }
  }

  async applyHead(recordCid: CID, state: DocumentState): Promise<DocumentState | null> {
    this.#logger.debug(`Applying head ${recordCid.toString()}`)
    const localLog = state.log
    const remoteLog = await this.tail(localLog, recordCid)
    // Case 1: Log is fully applied
    if (remoteLog.isEmpty() || remoteLog.last.equals(localLog.last)) {
      this.#logger.debug(`Detected ${recordCid} is fully applied`)
      return null
    }
    // Case 2: Direct continuation
    const remoteStart = await this.#cloud.retrieve(remoteLog.first)
    if (remoteStart?.prev?.equals(localLog.last)) {
      this.#logger.debug(`Detected direct continuation for ${recordCid}`)
      return await this.applyLog(remoteLog, state)
    }
    // Case 3: Merge
    throw new NotImplementedError(`applyHead.else merge`)
  }

  async applyLog(log: Chain, state: DocumentState): Promise<DocumentState> {
    return log.reduce(async (state, entry) => {
      const content = await this.#cloud.retrieve(entry)
      const record = new RecordWrap(content, entry)
      const handler = this.#handlers.get(state.doctype)
      switch (record.kind) {
        case RecordWrap.Kind.SIGNED:
          return handler.applyUpdate(record, state)
        case RecordWrap.Kind.ANCHOR:
          const proof = await this.#anchoring.verify(content, entry)
          return handler.applyAnchor(record, proof, state)
        case RecordWrap.Kind.GENESIS:
          throw new NotImplementedError(`DocumentService.applyLog:GENESIS`)
        default:
          throw new UnreachableCaseError(record.kind)
      }
    }, state)
  }

  async applyUpdate(updateRecord: RecordWrap, state: DocumentState) {
    const handler = this.#handlers.get(state.doctype)
    return handler.applyUpdate(updateRecord, state)
  }
}
