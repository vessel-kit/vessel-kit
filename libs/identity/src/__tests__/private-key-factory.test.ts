import { AlgorithmKind } from '../algorithm-kind';
import { PrivateKeyFactory } from '../private-key.factory';

const privateKeyFactory = new PrivateKeyFactory();
const bytesSeed = new Uint8Array([1, 2, 3]);
const stringSeed = 'hello';

describe('secp256k1', () => {
  test('generate from bytes', () => {
    const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, bytesSeed);
    expect(privateKey.alg).toEqual(AlgorithmKind.ES256K);
  });
  test('generate from string', () => {
    const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, stringSeed);
    expect(privateKey.alg).toEqual(AlgorithmKind.ES256K);
  });
});

describe('ed25519', () => {
  test('generate from bytes', () => {
    const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.EdDSA, bytesSeed);
    expect(privateKey.alg).toEqual(AlgorithmKind.EdDSA);
  });
  test('generate from string', () => {
    const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.EdDSA, stringSeed);
    expect(privateKey.alg).toEqual(AlgorithmKind.EdDSA);
  });
});
