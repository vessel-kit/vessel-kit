import * as ES256K from '../ES256K';
import * as _ from 'lodash';
import { AlgorithmKind } from '../../algorithm-kind';

const material = new Uint8Array(_.times(32, () => 1));
const key = new ES256K.PrivateKey(material);
const message = new Uint8Array(_.times(32, (n) => n));

describe('PublicKey', () => {
  test('properties', () => {
    const material = new Uint8Array(_.times(32, () => 1));
    const publicKey = new ES256K.PublicKey(material);
    expect(publicKey.alg).toEqual(AlgorithmKind.ES256K);
    expect(publicKey.material).toEqual(material);
  });

  test('verify', async () => {
    const publicKey = await key.publicKey();
    const signature = await key.sign(message);
    await expect(publicKey.verify(message, signature)).resolves.toBeTruthy();
    await expect(publicKey.verify(message, new Uint8Array())).resolves.toBeFalsy();
    await expect(publicKey.verify(new Uint8Array(), signature)).resolves.toBeFalsy();
    const wrongPublicKey = new ES256K.PublicKey(new Uint8Array());
    await expect(wrongPublicKey.verify(message, signature)).resolves.toBeFalsy();
  });
});

describe('PrivateKey', () => {
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
