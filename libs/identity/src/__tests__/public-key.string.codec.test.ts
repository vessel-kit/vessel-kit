import '@relmify/jest-fp-ts';
import { AlgorithmKind } from '../algorithm-kind';
import { PrivateKeyFactory } from '../private-key.factory';
import { PublicKeyStringCodec } from '../public-key.string.codec';
import { BytesMultibaseCodec } from "@vessel-kit/codec";

const privateKeyFactory = new PrivateKeyFactory();
const material = new Uint8Array([1, 2, 3]);

describe('is', () => {
  test('ok', async () => {
    const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, material);
    const publicKey = await privateKey.publicKey();
    expect(PublicKeyStringCodec.is(publicKey)).toBeTruthy();
  });

  test('not ok', async () => {
    expect(PublicKeyStringCodec.is({ garbage: true })).toBeFalsy();
    expect(PublicKeyStringCodec.is('just string£')).toBeFalsy();
  });
});

describe('encode', () => {
  test('ES256K', async () => {
    const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, material);
    const publicKey = await privateKey.publicKey();
    expect(PublicKeyStringCodec.encode(publicKey)).toMatchSnapshot();
  });
  test('Ed25519', async () => {
    const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.EdDSA, material);
    const publicKey = await privateKey.publicKey();
    expect(PublicKeyStringCodec.encode(publicKey)).toMatchSnapshot();
  });
});

describe('decode', () => {
  test('ES256K', async () => {
    const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, material);
    const publicKey = await privateKey.publicKey();
    expect(PublicKeyStringCodec.decode(PublicKeyStringCodec.encode(publicKey))).toEqualRight(publicKey);
  });
  test('Ed25519', async () => {
    const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.EdDSA, material);
    const publicKey = await privateKey.publicKey();
    expect(PublicKeyStringCodec.decode(PublicKeyStringCodec.encode(publicKey))).toEqualRight(publicKey);
  });
  test('garbage', () => {
    expect(PublicKeyStringCodec.decode('garbage')).toBeLeft();
    const garbage = BytesMultibaseCodec('base16').encode(material)
    expect(PublicKeyStringCodec.decode(garbage)).toBeLeft();
  });
});
