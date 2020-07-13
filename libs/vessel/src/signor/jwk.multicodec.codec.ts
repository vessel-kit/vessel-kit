import * as t from 'io-ts';
import jose from 'jose';
import base64url from 'base64url';
import * as multicodec from 'multicodec';

export const JWKMulticodecCodec = new t.Type<jose.JWK.Key, Buffer, Buffer>(
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
            x: base64url.encode(x),
            y: base64url.encode(y),
            kty: 'EC' as 'EC',
          }),
        );
      case 0xec:
        return t.success(
          jose.JWK.asKey({
            crv: 'X25519' as 'X25519',
            x: base64url.encode(point),
            kty: 'OKP' as 'OKP',
          }),
        );
      default:
        return t.failure(input, context, `Unexpected codec ${codecIndex}`);
    }
  },
  (a: jose.JWK.Key) => {
    if (a.crv === 'secp256k1' && a.kty === 'EC') {
      const x = base64url.toBuffer(a.x);
      const y = base64url.toBuffer(a.y);
      const publicKey = Buffer.concat([x, y]);
      return multicodec.addPrefix(Buffer.from('e7', 'hex'), publicKey);
    } else if (a.crv === 'X25519' && a.kty === 'OKP') {
      const publicKey = base64url.toBuffer(a.x);
      return multicodec.addPrefix(Buffer.from('ec', 'hex'), publicKey);
    } else {
      throw new Error(`Not implemented for kty ${a.kty}:${a.crv}`);
    }
  },
);
