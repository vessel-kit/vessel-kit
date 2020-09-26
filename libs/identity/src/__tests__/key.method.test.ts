import { AlgorithmKind } from '../algorithm-kind';
import * as didKey from '../key.method';
import { KeyMethod } from '../key.method';
import { Resolver } from 'did-resolver';
import { PrivateKeyFactory } from '../private-key.factory';
import { PublicKeyStringCodec } from '../public-key.string.codec';

const privateKeyFactory = new PrivateKeyFactory();

describe('didPresentation', () => {
  test('secp256k1', async () => {
    const secret = privateKeyFactory.fromSeed(AlgorithmKind.secp256k1, new Uint8Array([0, 1, 2]));
    const publicKey = await secret.publicKey();
    const presentation = await didKey.didDocument(publicKey);
    expect(presentation).toMatchSnapshot();
  });

  test('ed25519', async () => {
    const secret = privateKeyFactory.fromSeed(AlgorithmKind.ed25519, new Uint8Array([0, 1, 2]));
    const publicKey = await secret.publicKey();
    const presentation = await didKey.didDocument(publicKey);
    expect(presentation).toMatchSnapshot();
  });
});

describe('resolver', () => {
  const resolver = new Resolver(KeyMethod.getResolver());

  test('secp256k1', async () => {
    const secret = privateKeyFactory.fromSeed(AlgorithmKind.secp256k1, new Uint8Array([0, 1, 2]));
    const publicKey = await secret.publicKey();
    const fingerprint = PublicKeyStringCodec.encode(publicKey);
    const didDocument = await resolver.resolve(`did:key:${fingerprint}`);
    expect(didDocument).toMatchSnapshot();
  });

  test('ed25519', async () => {
    const secret = privateKeyFactory.fromSeed(AlgorithmKind.ed25519, new Uint8Array([0, 1, 2]));
    const publicKey = await secret.publicKey();
    const fingerprint = PublicKeyStringCodec.encode(publicKey);
    const didDocument = await resolver.resolve(`did:key:${fingerprint}`);
    expect(didDocument).toMatchSnapshot();
  });
});
