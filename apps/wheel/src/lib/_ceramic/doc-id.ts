import CID from 'cids';
import { URL } from 'url';

export class DocId {
  constructor(private readonly cid: CID) {}

  static build(something: string | URL | CID) {
    const cidString = something
      .toString()
      .replace(/^\/ceramic\//, '')
      .replace(/^ceramic:\/\//, '');
    return new DocId(new CID(cidString));
  }

  asURI() {
    return new URL(`ceramic://${this.cid.toString()}`);
  }

  toString() {
    return `/ceramic/${this.cid.toString()}`;
  }
}
