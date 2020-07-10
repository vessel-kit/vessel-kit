import * as t from 'io-ts';
import jose from 'jose';
import base64url from 'base64url';
import { PublicKey } from './public-key';
import * as multicodec from 'multicodec';

export const PublicKeyMulticodecCodec = new t.Type<PublicKey, Buffer, Buffer>(
  'PublicKey-multicodec',
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
