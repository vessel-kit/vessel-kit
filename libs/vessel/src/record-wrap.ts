import CID from 'cids';

enum RecordKind {
  GENESIS,
  SIGNED,
  ANCHOR,
}

function detectRecordKind(record: any): RecordKind {
  if (record.prev) {
    if (record.proof) {
      return RecordKind.ANCHOR
    } else {
      return RecordKind.SIGNED
    }
  } else {
    return RecordKind.GENESIS
  }
}

export class RecordWrap {
  #kind: RecordKind
  #load: any
  #cid: CID

  static Kind = RecordKind;

  constructor(load: any, cid: CID) {
    this.#load = load
    this.#kind = detectRecordKind(load)
    this.#cid = cid
  }

  get kind (): RecordKind {
    return this.#kind
  }

  get load () {
    return this.#load
  }

  get cid () {
    return this.#cid
  }
}
