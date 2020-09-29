import { PrivateKeyFactory } from '../../private-key.factory';
import { AlgorithmKind } from '../../algorithm-kind';
import * as jws from '../jws';
import * as keyMethod from '../../key.method';
import { InvalidJWSError } from '../jws';
import { Resolver } from 'did-resolver';

const privateKeyFactory = new PrivateKeyFactory();
const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, 'seed');

test('create', async () => {
  const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
  const signature = await jws.create(signer, { hello: 'world' });
  expect(signature).toMatchSnapshot();
});

describe('decode', () => {
  test('ok', async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const payload = { hello: 'world' };
    const signature = await jws.create(signer, payload);
    const decoded = jws.decode(signature);
    expect(decoded).toMatchSnapshot();
    expect(decoded.payload).toEqual(payload);
  });

  test('malformed jws', async () => {
    expect(() => jws.decode('malformed jws')).toThrow(new InvalidJWSError('Wrong format'));
  });

  test('no kid', async () => {
    const noKid = 'eyJhbGciOiJub25lIn0.e30.eyJhbGciOiJub25lIn0';
    expect(() => jws.decode(noKid)).toThrow(new InvalidJWSError('Missing kid header'));
  });

  test('no alg', async () => {
    const noKid = 'eyJraWQiOiAiZm9vIn0.e30.eyJhbGciOiJub25lIn0';
    expect(() => jws.decode(noKid)).toThrow(new InvalidJWSError('Missing alg header'));
  });
});

describe('verify', () => {
  test('ok', async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const signature = await jws.create(signer, { hello: 'world' });
    const resolver = new Resolver({
      ...keyMethod.getResolver(),
    });
    const result = await jws.verify(signature, resolver);
    expect(result).toBeTruthy();
  });
  test.todo('no document');
  test.todo('no keys');
  test.todo('wrong key');
});

test.todo('verifyDetached');
