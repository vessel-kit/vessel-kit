import { PublicKey, multicodecCodec as PublicKeyMulticodec } from './public-key';
import { BufferMultibaseCodec } from './codecs/buffer-multibase-codec';
import * as t from 'io-ts';
import { MapCodec } from './codecs/map-codec';
import { isEmpty, lefts, rights } from 'fp-ts/lib/Array';
import { isRight } from 'fp-ts/lib/Either';

const codec = new t.Type<ThreeIdContent, any, any>(
  'PublicKeyMulticodec',
  (input: unknown): input is ThreeIdContent => input instanceof ThreeIdContent,
  (input: any) => {
    const ownersR = input.owners.map(o => BufferMultibaseCodec.pipe(PublicKeyMulticodec).decode(o));
    if (isEmpty(lefts(ownersR))) {
      const owners: Array<PublicKey> = rights(ownersR);
      const contentR = MapCodec(BufferMultibaseCodec.pipe(PublicKeyMulticodec)).decode(input.content.publicKeys);
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
      owners: a.owners.map(o => BufferMultibaseCodec.pipe(PublicKeyMulticodec).encode(o)),
      content: {
        publicKeys: MapCodec(BufferMultibaseCodec.pipe(PublicKeyMulticodec)).encode(a.publicKeys),
      },
    };
  },
);

export class ThreeIdContent {
  static doctype = '3id';
  static codec = codec

  owners: PublicKey[];
  publicKeys: Map<string, PublicKey>;

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
}
