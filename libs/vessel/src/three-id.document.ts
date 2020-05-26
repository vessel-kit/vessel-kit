import { PublicKey, multicodecCodec as PublicKeyMulticodec } from './public-key';
import { BufferMultibaseCodec } from './codecs/buffer-multibase-codec';
import * as t from 'io-ts';
import { MapCodec } from './codecs/map-codec';

export class ThreeIdDocument {
  static doctype = '3id';

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
    return new ThreeIdDocument(nextOwners, nextPublicKeys);
  }
}

export const JsonCodec = t.type({
  owners: t.array(BufferMultibaseCodec.pipe(PublicKeyMulticodec)),
  publicKeys: MapCodec(BufferMultibaseCodec.pipe(PublicKeyMulticodec)),
});
