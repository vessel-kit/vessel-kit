import { SecretFactory } from '../secret-factory';
import { KeyKind } from '../key-kind';
import * as didKey from '../key.method';
import { KeyMethod } from "../key.method";
import { Resolver } from 'did-resolver'

const secretFactory = new SecretFactory();

describe('didPresentation', () => {
  test('secp256k1', async () => {
    const secret = secretFactory.fromSeed(KeyKind.secp256k1, new Uint8Array([0, 1, 2]));
    const publicKey = await secret.publicKey();
    const presentation = await didKey.didDocument(publicKey);
    expect(presentation).toMatchSnapshot();
  });

  test('ed25519', async () => {
    const secret = secretFactory.fromSeed(KeyKind.ed25519, new Uint8Array([0, 1, 2]));
    const publicKey = await secret.publicKey();
    const presentation = await didKey.didDocument(publicKey);
    expect(presentation).toMatchSnapshot();
  });
});

describe('resolver', () => {
  const resolver = new Resolver(KeyMethod.getResolver())

  test('secp256k1', async () => {
    const secret = secretFactory.fromSeed(KeyKind.secp256k1, new Uint8Array([0, 1, 2]));
    const publicKey = await secret.publicKey();
    const didDocument = await resolver.resolve(`did:key:${publicKey.toString()}`)
    expect(didDocument).toMatchSnapshot()
  });

  test('ed25519', async () => {
    const secret = secretFactory.fromSeed(KeyKind.ed25519, new Uint8Array([0, 1, 2]));
    const publicKey = await secret.publicKey();
    const didDocument = await resolver.resolve(`did:key:${publicKey.toString()}`)
    expect(didDocument).toMatchSnapshot()
  });
});
