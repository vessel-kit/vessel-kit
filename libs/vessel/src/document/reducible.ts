import { History } from '../util/history';
import CID from 'cids';

export type IWithHistory = { log: History };

export interface IReducer<A extends IWithHistory> {
  (current: A, pointer: CID): Promise<A>;
}

export class Reducible<A extends IWithHistory> {
  constructor(readonly view: A, readonly reducer: IReducer<A>) {}

  get log(): History {
    return this.view.log
  }

  async apply(history: History): Promise<Reducible<A>> {
    return history.reduce<Reducible<A>>(async (acc, pointer) => {
      const next = await this.reducer(acc.view, pointer);
      return new Reducible(next, this.reducer);
    }, this);
  }
}

export type IPrevious = (cid: CID) => Promise<CID | null>;
export type IPrefer<A extends IWithHistory> = (a: Reducible<A>, b: Reducible<A>) => Promise<Reducible<A>>;

export class ConflictResolution<A extends IWithHistory> {
  #reducible: Reducible<A>;
  #previous: IPrevious;
  #prefer: IPrefer<A>;

  constructor(reducible: Reducible<A>, previous: IPrevious, prefer: IPrefer<A>) {
    this.#reducible = reducible;
    this.#previous = previous;
    this.#prefer = prefer;
  }

  get history(): History {
    return this.#reducible.log;
  }

  async tail(tip: CID, acc: CID[] = []): Promise<History> {
    if (this.history.has(tip)) {
      return new History(acc.reverse());
    } else {
      const prev = await this.#previous(tip);
      if (prev) {
        return this.tail(prev, acc.concat(tip));
      } else {
        return new History([]);
      }
    }
  }

  async apply(head: CID): Promise<Reducible<A>> {
    const remoteLog = await this.tail(head);
    // Case 1: Log is fully applied
    if (remoteLog.isEmpty() || remoteLog.last.equals(this.history.last)) {
      // this.#logger.debug(`Detected ${recordCid} is fully applied`);
      return this.#reducible;
    }

    // Case 2: Direct continuation
    const remotePrev = await this.#previous(remoteLog.first);
    if (remotePrev?.equals(this.history.last)) {
      // this.#logger.debug(`Detected direct continuation for ${recordCid}`);
      // return await this.applyLog(remoteLog, state);
      return this.#reducible.apply(remoteLog);
    }

    // Case 3: Merge
    // this.#logger.debug(`Detected merge required for ${recordCid}`);
    const conflictIdx = this.history.findIndex((x) => x.equals(remotePrev));
    const commonHistory = this.history.slice(conflictIdx + 1);
    const commonState = await this.#reducible.apply(commonHistory);

    const localState = await commonState.apply(this.history);
    const remoteState = await commonState.apply(remoteLog);

    return this.#prefer(localState, remoteState);
  }
}
