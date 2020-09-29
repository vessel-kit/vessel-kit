import { PrivateKeyFactory } from '../private-key.factory';
import { AlgorithmKind } from '../algorithm-kind';
import { KeyIdentity } from '../key-identity';
import * as jws from '../did-jose/jws';
import { Resolver } from 'did-resolver';
import * as keyMethod from '../key.method';

const privateKeyFactory = new PrivateKeyFactory();
const seed = 'seed';
const payload = { hello: 'world' };

describe('did', () => {
  test('ES256K', async () => {
    const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, seed);
    const identity = new KeyIdentity(privateKey);
    const did = await identity.did();
    expect(did).toMatchSnapshot();
  });

  test('EdDSA', async () => {
    const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.EdDSA, seed);
    const identity = new KeyIdentity(privateKey);
    const did = await identity.did();
    expect(did).toMatchSnapshot();
  });
});

describe('sign', () => {
  test('ES256K', async () => {
    const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, seed);
    const identity = new KeyIdentity(privateKey);
    const signature = await identity.sign(payload);
    expect(jws.isAttached(signature)).toBeTruthy();
    expect(signature).toMatchSnapshot();
    const resolver = new Resolver({
      ...keyMethod.getResolver(),
    });
    await expect(jws.verify(signature, resolver)).resolves.toBeTruthy();
  });

  test('EdDSA', async () => {
    const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.EdDSA, seed);
    const identity = new KeyIdentity(privateKey);
    const signature = await identity.sign(payload);
    expect(jws.isAttached(signature)).toBeTruthy();
    expect(signature).toMatchSnapshot();
    const resolver = new Resolver({
      ...keyMethod.getResolver(),
    });
    await expect(jws.verify(signature, resolver)).resolves.toBeTruthy();
  });
});
