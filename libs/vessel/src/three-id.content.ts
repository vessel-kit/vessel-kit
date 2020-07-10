import { PublicKey } from './person/public-key';
import { BufferMultibaseCodec } from '@potter/codec';
import * as t from 'io-ts';
import { MapCodec } from './codec/map-codec';
import { isEmpty, lefts, rights } from 'fp-ts/lib/Array';
import { isRight } from 'fp-ts/lib/Either';
import jsonPatch from 'fast-json-patch';
import { PublicKeyMulticodecCodec } from './person/public-key.multicodec.codec';

const codec = new t.Type<ThreeIdContent, any, any>(
  'PublicKeyMulticodec',
  (input: unknown): input is ThreeIdContent => input instanceof ThreeIdContent,
  (input: any) => {
    const ownersR = input.owners.map(o => BufferMultibaseCodec.pipe(PublicKeyMulticodecCodec).decode(o));
    if (isEmpty(lefts(ownersR))) {
      const owners: Array<PublicKey> = rights(ownersR);
      const contentR = MapCodec(BufferMultibaseCodec.pipe(PublicKeyMulticodecCodec)).decode(input.content.publicKeys);
      if (isRight(contentR)) {
        const publicKeys = contentR.right;
        return t.success(new ThreeIdContent(owners, publicKeys));
      } else {
        return contentR;
      }
    } else {
      return t.failures(lefts(ownersR));
    }
  },
  (a: ThreeIdContent) => {
    return {
      owners: a.owners.map(o => BufferMultibaseCodec.pipe(PublicKeyMulticodecCodec).encode(o)),
      content: {
        publicKeys: MapCodec(BufferMultibaseCodec.pipe(PublicKeyMulticodecCodec)).encode(a.publicKeys),
      },
    };
  },
);

export class ThreeIdContent {
  static doctype = '3id';
  static codec = codec;

  public readonly doctype = ThreeIdContent.doctype
  owners: PublicKey[];
  publicKeys: Map<string, PublicKey>;
  public readonly governance = null

  constructor(owners: PublicKey[], publicKeys: Map<string, PublicKey>) {
    this.owners = owners;
    this.publicKeys = publicKeys;
  }

  clone() {
    const nextOwners = this.owners.map(o => o.clone());
    const nextPublicKeys = new Map<string, PublicKey>();
    this.publicKeys.forEach((value, key) => {
      nextPublicKeys.set(key, value.clone());
    });
    return new ThreeIdContent(nextOwners, nextPublicKeys);
  }

  delta(from: ThreeIdContent) {
    const fromJSON = ThreeIdContent.codec.encode(from);
    const toJSON = ThreeIdContent.codec.encode(this);
    const delta = jsonPatch.compare(fromJSON, toJSON);
    return delta;
  }
}
