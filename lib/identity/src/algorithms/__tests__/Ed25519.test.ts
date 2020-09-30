import * as ed25519 from '../EdDSA';
import * as _ from 'lodash';
import { AlgorithmKind } from '../../algorithm-kind';

const material = new Uint8Array(_.times(32, () => 1));
const key = new ed25519.PrivateKey(material);
const message = new Uint8Array(_.times(32, (n) => n));

describe('PublicKey', () => {
  test('properties', () => {
    const key = new ed25519.PublicKey(material);
    expect(key.alg).toEqual(AlgorithmKind.EdDSA);
    expect(key.material).toEqual(material);
  });

  test('verify', async () => {
    const publicKey = await key.publicKey();
    const signature = await key.sign(message);
    await expect(publicKey.verify(message, signature)).resolves.toBeTruthy();
    await expect(publicKey.verify(message, new Uint8Array())).resolves.toBeFalsy();
  });
});

describe('PrivateKey', () => {
  const material = new Uint8Array(_.times(32, () => 1));
  const key = new ed25519.PrivateKey(material);
  test('fields', async () => {
    expect(key.alg).toEqual(AlgorithmKind.EdDSA);
    const publicKey = await key.publicKey();
    expect(publicKey).toMatchSnapshot();
  });
  test('sign', async () => {
    const signature = await key.sign(material);
    expect(signature).toMatchSnapshot();
  });
});
