import { Cloud } from './cloud/cloud';
import { History } from './util/history';
import CID from 'cids';
import { ILogger } from './util/logger.interface';
import { RecordWrap } from '@vessel-kit/codec';
import { AnchoringService } from './anchoring.service';
import { Snapshot } from './document/document.interface';
import { IDoctype } from './document/doctype';
import { DocId } from '@vessel-kit/codec';
import { Ordering } from './document/ordering';

export class InvalidOrdering extends Error {
  constructor(ordering: never) {
    super(`Received invalid ordering ${ordering}`);
  }
}

export class DocumentUpdateService {
  #cloud: Cloud;
  #logger: ILogger;
  #anchoring: AnchoringService;

  constructor(logger: ILogger, anchoring: AnchoringService, cloud: Cloud) {
    this.#logger = logger.withContext(DocumentUpdateService.name);
    this.#cloud = cloud;
    this.#anchoring = anchoring;
  }

  async tail(local: History, tip: CID, log: CID[] = []): Promise<History> {
    if (local.has(tip)) {
      return new History(log.reverse());
    } else {
      const record = await this.#cloud.retrieve(tip);
      const prev = record.prev as CID | null;
      if (prev) {
        const nextLog = log.concat(tip);
        return this.tail(local, prev, nextLog);
      } else {
        return new History([]);
      }
    }
  }

  async applyHead<State, Shape>(recordCid: CID, handler: IDoctype<State, Shape>, state: Snapshot<State>): Promise<Snapshot<State>> {
    this.#logger.debug(`Applying head ${recordCid.toString()}`);
    const localLog = state.log;
    const remoteLog = await this.tail(localLog, recordCid);
    // Case 1: Log is fully applied
    if (remoteLog.isEmpty() || remoteLog.last.equals(localLog.last)) {
      this.#logger.debug(`Detected ${recordCid} is fully applied`);
      return state;
    }
    // Case 2: Direct continuation
    const remoteStart = await this.#cloud.retrieve(remoteLog.first);
    if (remoteStart?.prev?.equals(localLog.last)) {
      this.#logger.debug(`Detected direct continuation for ${recordCid}`);
      return await this.applyLog(remoteLog, handler, state);
    }
    // Case 3: Merge
    // const conflictIdx = localLog.log.findIndex(x => x.equals(record.prev)) + 1
    this.#logger.debug(`Detected merge required for ${recordCid}`);
    const record = await this.#cloud.retrieve(remoteLog.first);
    const conflictIdx = localLog.findIndex((x) => x.equals(record.prev));
    const nonConflictingLog = localLog.slice(conflictIdx + 1);
    const nonConflictingState = await this.applyLog(nonConflictingLog, handler, state);
    const localState = await this.applyLog(localLog, handler, nonConflictingState);
    const remoteState = await this.applyLog(remoteLog, handler, nonConflictingState);
    const ordering = await handler.order(localState.view, remoteState.view);
    switch (ordering) {
      case Ordering.LT:
        return remoteState;
      case Ordering.GT:
        return localState;
      default:
        throw new InvalidOrdering(ordering);
    }
  }

  async applyLog<State, Shape>(log: History, handler: IDoctype<State, Shape>, state: Snapshot<State>): Promise<Snapshot<State>> {
    return log.reduce(async (state, entry) => {
      const content = await this.#cloud.retrieve(entry);
      const record = new RecordWrap(content, entry);
      const docId = new DocId(state.log.first);
      const next = await handler.apply(record, state.view, docId)
      return {
        ...state,
        view: next,
        log: state.log.concat(entry)
      }
    }, state);
  }

  async applyUpdate<State, Shape>(updateRecord: RecordWrap, handler: IDoctype<State, Shape>, state: Snapshot<State>): Promise<Snapshot<State>> {
    console.log('apply-update', state.log, updateRecord.load)
    if (state.log.last.equals(updateRecord.load.prev)) {
      const docId = new DocId(state.log.first);
      const next = await handler.apply(updateRecord, state.view, docId);
      return {
        ...state,
        log: state.log.concat(updateRecord.cid),
        view: next,
      };
    } else {
      throw new Error(`Update should reference last log entry ${state.log.last}, got ${updateRecord.load.prev}`);
    }
  }
}
