import CID from 'cids';

const PATTERN = new RegExp(/(ceramic:\/\/|\/ceramic\/)(\w+)/);

export class CeramicDocumentId {
  constructor(private readonly cid: CID) {}

  static fromString(s: string) {
    const match = PATTERN.exec(s);
    if (!match || !match[2]) throw new Error(`Invalid Ceramic identifier ${s}`);
    const cidString = match[2];
    const cid = new CID(cidString);
    return new CeramicDocumentId(cid);
  }

  toString() {
    return `ceramic://${this.cid.toString()}`;
  }
}
