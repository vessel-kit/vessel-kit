import CID from 'cids';
import { normalizeRecord } from './normalize-record';

export class RecordWrap<A = any> {
  #load: A;
  #cid: CID;

  constructor(load: A, cid: CID) {
    this.#load = normalizeRecord(load);
    this.#cid = cid;
  }

  get load(): A {
    return this.#load;
  }

  get cid(): CID {
    return this.#cid;
  }
}
