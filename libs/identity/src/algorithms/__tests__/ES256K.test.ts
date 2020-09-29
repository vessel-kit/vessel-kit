import * as secp256k1 from '../ES256K';
import * as _ from 'lodash';
import { AlgorithmKind } from '../../algorithm-kind';

describe('PublicKey', () => {
  test('fields', () => {
    const material = new Uint8Array(_.times(32, () => 1));
    const key = new secp256k1.PublicKey(material);
    expect(key.kind).toEqual(AlgorithmKind.ES256K);
    expect(key.material).toEqual(material);
  });
});

describe('PrivateKey', () => {
  const material = new Uint8Array(_.times(32, () => 1));
  const key = new secp256k1.PrivateKey(material);
  test('fields', async () => {
    expect(key.alg).toEqual(AlgorithmKind.ES256K);
    const publicKey = await key.publicKey();
    expect(publicKey).toMatchSnapshot();
  });
  test('sign', async () => {
    const signature = await key.sign(material);
    expect(signature).toMatchSnapshot();
  });
});

describe('verifySignature', () => {
  const material = new Uint8Array(_.times(32, () => 1));
  const key = new secp256k1.PrivateKey(material);
  const message = new Uint8Array(_.times(32, (n) => n));
  test('ok', async () => {
    const publicKey = await key.publicKey();
    const signature = await key.sign(message);
    expect(secp256k1.verifySignature(publicKey, message, signature)).toBeTruthy();
  });
  test('wrong input', async () => {
    const publicKey = await key.publicKey();
    const signature = await key.sign(message);
    expect(secp256k1.verifySignature(publicKey, new Uint8Array(), signature)).toBeFalsy();
  });
});
