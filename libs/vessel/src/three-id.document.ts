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
}

export const JsonCodec = t.type({
  owners: t.array(BufferMultibaseCodec.pipe(PublicKeyMulticodec)),
  publicKeys: MapCodec(BufferMultibaseCodec.pipe(PublicKeyMulticodec)),
});
