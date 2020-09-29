import { AlgorithmKind } from '../algorithm-kind';
import { PrivateKeyFactory } from '../private-key.factory';

const privateKeyFactory = new PrivateKeyFactory();

describe('secp256k1', () => {
  test('generate from bytes', () => {
    const secret = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, new Uint8Array([1, 2, 3]));
    expect(secret.alg).toEqual(AlgorithmKind.ES256K);
  });
  test('generate from string', () => {
    const secret = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, 'hello');
    expect(secret.alg).toEqual(AlgorithmKind.ES256K);
  });
});

describe('ed25519', () => {
  test('generate from bytes', () => {
    const secret = privateKeyFactory.fromSeed(AlgorithmKind.Ed25519, new Uint8Array([1, 2, 3]));
    expect(secret.alg).toEqual(AlgorithmKind.Ed25519);
  });
  test('generate from string', () => {
    const secret = privateKeyFactory.fromSeed(AlgorithmKind.Ed25519, 'hello');
    expect(secret.alg).toEqual(AlgorithmKind.Ed25519);
  });
});
