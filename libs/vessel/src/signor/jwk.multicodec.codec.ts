import * as t from 'io-ts';
import jose from 'jose';
import * as multicodec from 'multicodec';
import * as bytes from '@stablelib/bytes';
import { Uint8ArrayBase64StringCodec, decodeThrow } from '@vessel-kit/codec';

function isECKey(unknown: jose.JWK.Key): unknown is jose.JWK.ECKey {
  return unknown.crv === 'secp256k1' && unknown.kty === 'EC';
}

function isOKPKey(unknown: jose.JWK.Key): unknown is jose.JWK.OKPKey {
  return unknown.crv === 'X25519' && unknown.kty === 'OKP';
}

export const JWKMulticodecCodec = new t.Type<jose.JWK.Key, Uint8Array, Uint8Array>(
  'jose.JWK.Key-multicodec',
  (input: unknown): input is jose.JWK.Key => jose.JWK.isKey(input),
  (input, context) => {
    const codecIndex = multicodec.getCode(input);
    const point = multicodec.rmPrefix(input);
    switch (codecIndex) {
      case 0xe7:
        let x = point.slice(0, point.length / 2);
        let y = point.slice(point.length / 2, point.length);
        return t.success(
          jose.JWK.asKey({
            crv: 'secp256k1' as 'secp256k1',
            x: Uint8ArrayBase64StringCodec.encode(x),
            y: Uint8ArrayBase64StringCodec.encode(y),
            kty: 'EC' as 'EC',
          }),
        );
      case 0xec:
        return t.success(
          jose.JWK.asKey({
            crv: 'X25519' as 'X25519',
            x: Uint8ArrayBase64StringCodec.encode(point),
            kty: 'OKP' as 'OKP',
          }),
        );
      default:
        return t.failure(input, context, `Unexpected codec ${codecIndex}`);
    }
  },
  (a: jose.JWK.Key) => {
    if (isECKey(a)) {
      const x = decodeThrow(Uint8ArrayBase64StringCodec, a.x);
      const y = decodeThrow(Uint8ArrayBase64StringCodec, a.y);
      const publicKey = bytes.concat(x, y);
      return multicodec.addPrefix(Uint8Array.from([0xe7]), publicKey);
    } else if (isOKPKey(a)) {
      const publicKey = decodeThrow(Uint8ArrayBase64StringCodec, a.x);
      return multicodec.addPrefix(Uint8Array.from([0xec]), publicKey);
    } else {
      throw new Error(`Not implemented for kty ${a.kty}:${a.crv}`);
    }
  },
);
