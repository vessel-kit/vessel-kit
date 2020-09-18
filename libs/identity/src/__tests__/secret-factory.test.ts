import { SecretFactory } from '../secret-factory';
import { KeyKind } from '../key-kind';

const secretFactory = new SecretFactory();

describe('secp256k1', () => {
  test('generate from bytes', () => {
    const secret = secretFactory.fromSeed(KeyKind.secp256k1, new Uint8Array([1, 2, 3]));
    expect(secret.kind).toEqual(KeyKind.secp256k1);
  });
  test('generate from string', () => {
    const secret = secretFactory.fromSeed(KeyKind.secp256k1, 'hello');
    expect(secret.kind).toEqual(KeyKind.secp256k1);
  });
});

describe('ed25519', () => {
  test('generate from bytes', () => {
    const secret = secretFactory.fromSeed(KeyKind.ed25519, new Uint8Array([1, 2, 3]));
    expect(secret.kind).toEqual(KeyKind.ed25519);
  });
  test('generate from string', () => {
    const secret = secretFactory.fromSeed(KeyKind.ed25519, 'hello');
    expect(secret.kind).toEqual(KeyKind.ed25519);
  });
});
