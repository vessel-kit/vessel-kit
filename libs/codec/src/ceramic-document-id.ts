import CID from 'cids';

const PATTERN = new RegExp(/(ceramic:\/\/|\/ceramic\/)(\w+)/);

export class CeramicDocumentId {
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
      return new CeramicDocumentId(cid);
    } else {
      const cid = new CID(s);
      return new CeramicDocumentId(cid);
    }
  }

  valueOf() {
    return this.cid.toString();
  }

  toString() {
    return `ceramic://${this.cid.toString()}`;
  }
}
