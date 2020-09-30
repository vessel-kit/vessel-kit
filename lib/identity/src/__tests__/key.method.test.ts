import '@relmify/jest-fp-ts';
import { Resolver } from 'did-resolver';
import * as keyMethod from '../key.method';
import * as ES256K from '../algorithms/ES256K';
import * as Ed25519 from '../algorithms/EdDSA';
import * as _ from 'lodash';
import { AlgorithmKind } from '../algorithm-kind';
import { PrivateKeyFactory } from '../private-key.factory';
import { PublicKeyStringCodec } from '../key.method';
import { BytesMultibaseCodec } from '@vessel-kit/codec';

describe('resolver', () => {
  const material = new Uint8Array(_.times(32, () => 1));

  const resolver = new Resolver({
    ...keyMethod.getResolver(),
  });

  test('resolve ES256K key', async () => {
    const publicKey = new ES256K.PublicKey(material);
    const did = keyMethod.identifier(publicKey).toString();
    const didDocument = await resolver.resolve(did);
    expect(didDocument).toMatchSnapshot();
  });

  test('resolve EdDSA key', async () => {
    const publicKey = new Ed25519.PublicKey(material);
    const did = keyMethod.identifier(publicKey).toString();
    const didDocument = await resolver.resolve(did);
    expect(didDocument).toMatchSnapshot();
  });

  test('not resolve garbage key did', async () => {
    await expect(resolver.resolve('did:key:garbage')).rejects.toThrow();
  });
});

describe('PublicKeyStringCodec', () => {
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
      const garbage = BytesMultibaseCodec('base16').encode(material);
      expect(PublicKeyStringCodec.decode(garbage)).toBeLeft();
    });
  });
});
