import { AlgorithmKind } from '../algorithm-kind';
import { PrivateKeyFactory } from '../private-key.factory';

const privateKeyFactory = new PrivateKeyFactory();

describe('secp256k1', () => {
  test('generate from bytes', () => {
    const secret = privateKeyFactory.fromSeed(AlgorithmKind.secp256k1, new Uint8Array([1, 2, 3]));
    expect(secret.kind).toEqual(AlgorithmKind.secp256k1);
  });
  test('generate from string', () => {
    const secret = privateKeyFactory.fromSeed(AlgorithmKind.secp256k1, 'hello');
    expect(secret.kind).toEqual(AlgorithmKind.secp256k1);
  });
});

describe('ed25519', () => {
  test('generate from bytes', () => {
    const secret = privateKeyFactory.fromSeed(AlgorithmKind.ed25519, new Uint8Array([1, 2, 3]));
    expect(secret.kind).toEqual(AlgorithmKind.ed25519);
  });
  test('generate from string', () => {
    const secret = privateKeyFactory.fromSeed(AlgorithmKind.ed25519, 'hello');
    expect(secret.kind).toEqual(AlgorithmKind.ed25519);
  });
});
