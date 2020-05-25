import jose from 'jose';
import * as multicodec from 'multicodec';
import base64url from 'base64url';
import * as t from 'io-ts';
import { PublicKey, multicodecCodec as PublicKeyMultiCodec } from './public-key';

const KEY_A = {
  crv: 'secp256k1' as 'secp256k1',
  x: 'mTsVRRVOHgyd4HQoOdc7FP7DHGgCxjqXz-52AWBp2l8',
  y: 'q0sojdvefySPiNqhnt-BsdbrvlcLkv3t6luCDCPKuf0',
  d: 'IkcNFsFupww76DVIT3CG20phcNzUF9ZUYjJfXCi84qc',
  kty: 'EC' as 'EC',
  kid: 'tQWqroxi9P40-26AdkhanWwwo_U6j9Ydl5khOXn-jsA',
};

const KEY_B = {
  crv: 'secp256k1' as 'secp256k1',
  x: 'YrtcWMcwwbLP3eMowIU4bgBiZacClCIlfE3Mm6YU7CY',
  y: 'UFo9LeyQF9HQbKRs43f19x98d7TOcEMB8pd_jNZw-lA',
  d: 'EDqkfubdxeGrchJHAF4jR3KE9bV3ILXJc7JgLN4Y1Cg',
  kty: 'EC' as 'EC',
  kid: 'KE9ld4dYiSMNg3Hy5uNJt__Urt6rb2V4mK92p4_f42M',
};

const KEY_C = {
  crv: 'X25519' as 'X25519',
  x: '_Lh9XArich4ckRMStOa1y6dV24KNUJQILi4eIuSn3CY',
  d: '-Os3rBT2H4RVsu7vFnmlX1DzvZ0pKI9gP6UhgIhSZFI',
  kty: 'OKP' as 'OKP',
  kid: 'h3ITqvUm464H-W74fY9HaNPVh4MpxgrIuZre6TG9hwY',
};

const KEY_D = {
  crv: 'X25519' as 'X25519',
  x: 'uWcwFj6dJFqEOVUsam3MBO47HHwXeRH_edqxUFkdtRM',
  d: 'YF77ByC1QmUDFqWCcYYuhSB3fFmvOouIqBQE63NWM2g',
  kty: 'OKP' as 'OKP',
  kid: 'NRjNXZJrMAO2WlD56lGbbLZu9M7L6lh70lWQV2k_nxU',
};

async function main() {
  const keyA = jose.JWK.asKey(KEY_C);
  const publicKey = new PublicKey(keyA);
  // console.log('mul', publicKey.toMulticodec());
  const mul2 = PublicKeyMultiCodec.encode(publicKey);
  console.log('mul2', mul2);
  const dec = PublicKeyMultiCodec.decode(mul2)
  console.log(dec);
  // const x = base64url.toBuffer(keyA.x);
  // const y = base64url.toBuffer(keyA.y);
  // const rawPublicKey = Buffer.concat([x, y]);
  // console.log('pub', rawPublicKey.toString('hex'));
  // const privateKey = base64url.toBuffer(key.toJWK(true).d);
  // const pubRec = ethereum.privateToPublic(privateKey);
  // console.log('pub rec', pubRec.toString('hex'));
}

main();
