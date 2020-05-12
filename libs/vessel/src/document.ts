import CID from 'cids'
import { AnchorProof, AnchorStatus } from './anchor'
import { EventEmitter } from 'events'

export enum SignatureStatus {
  GENESIS,
  PARTIAL,
  SIGNED
}

export interface DocState {
  doctype: string;
  owners: Array<string>;
  content: any;
  nextContent?: any;
  signature: SignatureStatus;
  anchorStatus: AnchorStatus;
  anchorScheduledFor?: number; // only present when anchor status is pending
  anchorProof?: AnchorProof; // the anchor proof of the latest anchor, only present when anchor status is anchored
  log: Array<CID>;
}

export interface InitOpts {
  owners?: Array<string>;
  onlyGenesis?: boolean;
  skipWait?: boolean;
}


export class Document<State> {
  #state: State

  constructor(init: State) {
    this.#state = init
  }

  get state() {
    return this.#state
  }
}
