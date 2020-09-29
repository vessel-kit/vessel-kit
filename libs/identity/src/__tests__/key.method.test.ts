import { Resolver } from 'did-resolver';
import * as keyMethod from '../key.method';
import * as ES256K from '../algorithms/ES256K';
import * as Ed25519 from '../algorithms/EdDSA';
import * as _ from 'lodash';

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
