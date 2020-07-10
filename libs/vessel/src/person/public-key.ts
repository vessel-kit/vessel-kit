import jose from 'jose';
import base64url from 'base64url';
import { Right } from 'fp-ts/lib/Either';
import { PublicKeyMulticodecCodec } from './public-key.multicodec.codec';

export class PublicKey {
  constructor(readonly jwk: jose.JWK.Key) {}

  raw(): Buffer {
    if (this.jwk.crv === 'secp256k1' && this.jwk.kty === 'EC') {
      const x = base64url.toBuffer(this.jwk.x);
      const y = base64url.toBuffer(this.jwk.y);
      return Buffer.concat([x, y]);
    } else if (this.jwk.crv === 'X25519' && this.jwk.kty === 'OKP') {
      return base64url.toBuffer(this.jwk.x);
    } else {
      throw new Error(`Not implemented for kty ${this.jwk.kty}`);
    }
  }

  clone() {
    const recovered = PublicKeyMulticodecCodec.decode(PublicKeyMulticodecCodec.encode(this)) as Right<PublicKey>;
    return recovered.right;
  }
}
