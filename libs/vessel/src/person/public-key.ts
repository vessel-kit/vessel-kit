import jose from 'jose';
import base64url from 'base64url';
import * as t from 'io-ts';
import * as multicodec from 'multicodec';
import { Right } from 'fp-ts/lib/Either';

export const multicodecCodec = new t.Type<PublicKey, Buffer, Buffer>(
  'PublicKeyMulticodec',
  (input: unknown): input is PublicKey => input instanceof PublicKey,
  (input, context) => {
    const codecIndex = multicodec.getCode(input);
    const point = multicodec.rmPrefix(input);
    switch (codecIndex) {
      case 0xe7:
        let x = point.slice(0, point.length / 2);
        let y = point.slice(point.length / 2, point.length);
        return t.success(
          new PublicKey(
            jose.JWK.asKey({
              crv: 'secp256k1' as 'secp256k1',
              x: base64url.encode(x),
              y: base64url.encode(y),
              kty: 'EC' as 'EC',
            }),
          ),
        );
      case 0xec:
        return t.success(
          new PublicKey(
            jose.JWK.asKey({
              crv: 'X25519' as 'X25519',
              x: base64url.encode(point),
              kty: 'OKP' as 'OKP',
            }),
          ),
        );
      default:
        throw new Error(`Unexpected codec ${codecIndex}`);
    }
  },
  (a: PublicKey) => {
    const publicKey = a.raw();
    if (a.jwk.crv === 'secp256k1' && a.jwk.kty === 'EC') {
      return multicodec.addPrefix(Buffer.from('e7', 'hex'), publicKey);
    } else if (a.jwk.crv === 'X25519' && a.jwk.kty === 'OKP') {
      return multicodec.addPrefix(Buffer.from('ec', 'hex'), publicKey);
    } else {
      throw new Error(`Not implemented for kty ${a.jwk.kty}:${a.jwk.crv}`);
    }
  },
);

export class PublicKey {
  static codec = multicodecCodec;

  constructor(readonly jwk: jose.JWK.Key) {}

  raw() {
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
    const recovered = multicodecCodec.decode(multicodecCodec.encode(this)) as Right<PublicKey>;
    return recovered.right;
  }
}
