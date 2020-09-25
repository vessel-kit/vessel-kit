import { SecretFactory } from '../secret-factory';
import { KeyKind } from '../key-kind';
import * as sha256 from '@stablelib/sha256';
import { SignatureVerification } from '../signature-verification';

const signatureVerification = new SignatureVerification();
const secretFactory = new SecretFactory();
const seed = 'foo';

describe('Secp256k1Secret', () => {
  const secret = secretFactory.fromSeed(KeyKind.secp256k1, seed);
  const digest = sha256.hash(new Uint8Array([1, 2, 3]));
  test('sign', async () => {
    const signature = await secret.sign(digest);
    expect(signature).toMatchSnapshot();
    const pub = await secret.publicKey();
    expect(signatureVerification.secp256k1(pub.material, digest, signature)).toBeTruthy();
  });
});

describe('Ed25519Secret', () => {
  const secret = secretFactory.fromSeed(KeyKind.ed25519, seed);
  const digest = sha256.hash(new Uint8Array([1, 2, 3]));
  test('sign', async () => {
    const signature = await secret.sign(digest);
    expect(signature).toMatchSnapshot();
    const pub = await secret.publicKey();
    expect(signatureVerification.ed25519(pub.material, digest, signature)).toBeTruthy();
  });
});
