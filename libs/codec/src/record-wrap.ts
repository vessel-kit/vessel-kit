import CID from 'cids';
import { normalizeRecord } from './normalize-record';

enum RecordKind {
  GENESIS,
  SIGNED,
  ANCHOR,
}

// TODO Remove kinds
function detectRecordKind(record: any): RecordKind {
  if (record.prev) {
    if (record.proof) {
      return RecordKind.ANCHOR;
    } else {
      return RecordKind.SIGNED;
    }
  } else {
    return RecordKind.GENESIS;
  }
}

export class RecordWrap<A = any> {
  #kind: RecordKind;
  #load: A;
  #cid: CID;

  static Kind = RecordKind;

  constructor(load: A, cid: CID) {
    this.#load = normalizeRecord(load);
    this.#kind = detectRecordKind(this.#load);
    this.#cid = cid;
  }

  get kind(): RecordKind {
    return this.#kind;
  }

  get load(): A {
    return this.#load;
  }

  get cid(): CID {
    return this.#cid;
  }
}
