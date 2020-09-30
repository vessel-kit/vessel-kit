import CID from 'cids';

const PATTERN = new RegExp(/(vessel:\/\/|\/vessel\/)(\w+)/);

export class DocId {
  #cid: CID;

  constructor(cid: CID) {
    this.#cid = cid;
  }

  get cid() {
    return this.#cid;
  }

  static fromString(s: string) {
    const match = PATTERN.exec(s);
    if (match && match[2]) {
      const cidString = match[2];
      const cid = new CID(cidString);
      return new DocId(cid);
    } else {
      const cid = new CID(s);
      return new DocId(cid);
    }
  }

  valueOf() {
    return this.cid.toString();
  }

  toString() {
    return `vessel://${this.cid.toString()}`;
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return 'DocId(' + this.cid.toString() + ')';
  }
}
