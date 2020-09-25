import * as faker from 'faker';
import * as _ from 'lodash';
import { PublicKey, PublicKeyFingerprintCodec, PublicKeyMulticodecCodec } from '../public-key';
import { KeyKind } from '../key-kind';
import { SecretFactory } from '../secret-factory';

const secretFactory = new SecretFactory();

describe('PublicKey', () => {
  test('fields', () => {
    const material = new Uint8Array(_.times(10, () => faker.random.number()));
    const publicKey = new PublicKey(KeyKind.secp256k1, material);
    expect(publicKey.material).toEqual(material);
    expect(publicKey.kind).toEqual(KeyKind.secp256k1);
  });

  describe('toString', () => {
    test('secp256k1', async () => {
      const secp256k1Secret = secretFactory.fromSeed(KeyKind.secp256k1, new Uint8Array([0, 1, 2]));
      const secp256k1PublicKey = await secp256k1Secret.publicKey();
      expect(secp256k1PublicKey.toString()).toEqual('zQ3shhGCCLfpvn8U4EfCsCEE9VqtB9zY4aZBJg1Vc6KAmkPfp');
    });
    test('ed25519', async () => {
      const ed25519Secret = secretFactory.fromSeed(KeyKind.ed25519, new Uint8Array([0, 1, 2]));
      const ed25519PublicKey = await ed25519Secret.publicKey();
      expect(ed25519PublicKey.toString()).toEqual('z6LSdZ1fsvyB6quMTnKxnAwzYkmoxsuVHs3teXYN7kzUsyme');
    });
  });
});

describe('PublicKeyFingerprintCodec', () => {
  test('is', async () => {
    const secp256k1Secret = secretFactory.fromSeed(KeyKind.secp256k1, new Uint8Array([0, 1, 2]));
    const secp256k1PublicKey = await secp256k1Secret.publicKey();
    expect(PublicKeyFingerprintCodec.is(secp256k1PublicKey)).toBeTruthy();

    const ed25519Secret = secretFactory.fromSeed(KeyKind.ed25519, new Uint8Array([0, 1, 2]));
    const ed25519PublicKey = await ed25519Secret.publicKey();
    expect(PublicKeyMulticodecCodec.is(ed25519PublicKey)).toBeTruthy();
  });

  describe('encode', () => {
    test('secp256k1', async () => {
      const secp256k1Secret = secretFactory.fromSeed(KeyKind.secp256k1, new Uint8Array([0, 1, 2]));
      const secp256k1PublicKey = await secp256k1Secret.publicKey();
      expect(PublicKeyFingerprintCodec.encode(secp256k1PublicKey)).toEqual(
        'zQ3shhGCCLfpvn8U4EfCsCEE9VqtB9zY4aZBJg1Vc6KAmkPfp',
      );
    });
    test('ed25519', async () => {
      const ed25519Secret = secretFactory.fromSeed(KeyKind.ed25519, new Uint8Array([0, 1, 2]));
      const ed25519PublicKey = await ed25519Secret.publicKey();
      expect(PublicKeyFingerprintCodec.encode(ed25519PublicKey)).toEqual(
        'z6LSdZ1fsvyB6quMTnKxnAwzYkmoxsuVHs3teXYN7kzUsyme',
      );
    });
  });

  describe('decode', () => {
    test('secp256k1', async () => {
      const secp256k1Secret = secretFactory.fromSeed(KeyKind.secp256k1, new Uint8Array([0, 1, 2]));
      const secp256k1PublicKey = await secp256k1Secret.publicKey();

      const decoded = PublicKeyFingerprintCodec.decode('zQ3shhGCCLfpvn8U4EfCsCEE9VqtB9zY4aZBJg1Vc6KAmkPfp');
      expect(decoded).toEqualRight(secp256k1PublicKey);
    });
    test('ed25519', async () => {
      const ed25519Secret = secretFactory.fromSeed(KeyKind.ed25519, new Uint8Array([0, 1, 2]));
      const ed25519PublicKey = await ed25519Secret.publicKey();

      const decoded = PublicKeyFingerprintCodec.decode('z6LSdZ1fsvyB6quMTnKxnAwzYkmoxsuVHs3teXYN7kzUsyme');
      expect(decoded).toEqualRight(ed25519PublicKey);
    });

    test('not ok', async () => {
      const decoded = PublicKeyFingerprintCodec.decode('foo');
      expect(decoded).toBeLeft();
    });
  });
});
