import { Cloud } from './cloud/cloud';
import { Chain } from './chain';
import CID from 'cids';
import { DocumentState } from './document.state';
import { ILogger } from './logger/logger.interface';
import { RecordWrap } from './record-wrap';
import { UnreachableCaseError } from './unreachable-case.error';
import { AnchoringService } from './anchoring.service';
import { HandlersContainer } from './handlers/handlers.container';
import { AnchoringStatus } from '@potter/anchoring';

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
    // const conflictIdx = localLog.log.findIndex(x => x.equals(record.prev)) + 1
    this.#logger.debug(`Detected merge required for ${recordCid}`)
    const record = await this.#cloud.retrieve(remoteLog.first)
    const conflictIdx = localLog.findIndex(x => x.equals(record.prev))
    const nonConflictingLog = localLog.slice(conflictIdx + 1)
    const nonConflictingState = await this.applyLog(nonConflictingLog, state)
    const localState = await this.applyLog(localLog, nonConflictingState)
    const remoteState = await this.applyLog(remoteLog, nonConflictingState)
    if (remoteState.anchor.status ===  AnchoringStatus.ANCHORED && localState.anchor.status === AnchoringStatus.ANCHORED &&
      remoteState.anchor.proof.timestamp < localState.anchor.proof.timestamp) {
      // if the remote state is anchored before the local,
      // apply the remote log to our local state
      return remoteState
    }
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
          return {
            doctype: content.doctype,
            current: null,
            freight: content,
            anchor: {
              status: AnchoringStatus.NOT_REQUESTED
            },
            log: [entry]
          }
        default:
          throw new UnreachableCaseError(record.kind)
      }
    }, state)
  }

  async applyUpdate(updateRecord: RecordWrap, state: DocumentState) {
    if (state.log.last.equals(updateRecord.load.prev)) {
      const handler = this.#handlers.get(state.doctype)
      return handler.applyUpdate(updateRecord, state)
    } else {
      throw new Error(`Update should reference last log entry ${state.log.last}, got ${updateRecord.load.prev}`)
    }
  }
}