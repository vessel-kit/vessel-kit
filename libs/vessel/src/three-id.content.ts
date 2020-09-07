import jose from 'jose';
import { BufferMultibaseCodec } from '@vessel-kit/codec';
import * as t from 'io-ts';
import { MapCodec } from './util/map-codec';
import { isEmpty, lefts, rights } from 'fp-ts/lib/Array';
import { isRight } from 'fp-ts/lib/Either';
import jsonPatch from 'fast-json-patch';
import { JWKMulticodecCodec } from './signor/jwk.multicodec.codec';

export const ThreeIdContentJSONCodec = new t.Type<ThreeIdContent, any, any>(
  'ThreeIdContent-json',
  (input: unknown): input is ThreeIdContent => input instanceof ThreeIdContent,
  (input: any) => {
    const ownersR = input.owners.map((o) => BufferMultibaseCodec.pipe(JWKMulticodecCodec).decode(o));
    if (isEmpty(lefts(ownersR))) {
      const owners: Array<jose.JWK.Key> = rights(ownersR);
      const contentR = MapCodec(BufferMultibaseCodec.pipe(JWKMulticodecCodec)).decode(input.content.publicKeys);
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
      owners: a.owners.map((o) => BufferMultibaseCodec.pipe(JWKMulticodecCodec).encode(o)),
      content: {
        publicKeys: MapCodec(BufferMultibaseCodec.pipe(JWKMulticodecCodec)).encode(a.publicKeys),
      },
    };
  },
);

export class ThreeIdContent {
  static doctype = '3id';
  static codec = ThreeIdContentJSONCodec;

  public readonly doctype = ThreeIdContent.doctype;
  owners: jose.JWK.Key[];
  publicKeys: Map<string, jose.JWK.Key>;

  constructor(owners: jose.JWK.Key[], publicKeys: Map<string, jose.JWK.Key>) {
    this.owners = owners;
    this.publicKeys = publicKeys;
  }

  clone() {
    // @ts-ignore
    const nextOwners = this.owners.map((o) => jose.JWK.asKey(o));
    const nextPublicKeys = new Map<string, jose.JWK.Key>();
    this.publicKeys.forEach((value, key) => {
      // @ts-ignore
      nextPublicKeys.set(key, jose.JWK.asKey(value));
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
