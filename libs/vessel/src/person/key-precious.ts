import Keyring from 'identity-wallet/lib/keyring';
import * as multicodec from 'multicodec';
import { PublicKey } from '..';
import * as tPromise from 'io-ts-promise'
import { ethers } from 'ethers';

function secp256k1PubKeyFromCompressed(compressedHex: string) {
  const publicKey = ethers.utils.computePublicKey(compressedHex)
  const asBuffer = Buffer.from(publicKey.replace('0x04', ''), 'hex')
  // It is secp256k1 public key
  const encoded = multicodec.addPrefix(Buffer.from('e7', 'hex'), asBuffer)
  return tPromise.decode(PublicKey.codec, encoded)
}

export class KeyPrecious {
  readonly #keyring: Keyring

  constructor(keyring: Keyring) {
    this.#keyring = keyring
  }

  static fromSeed(seed: string) {
    const keyring = new Keyring(seed)
    return KeyPrecious.fromKeyring(keyring)
  }

  static fromKeyring(keyring: Keyring) {
    return new KeyPrecious(keyring)
  }

  /**
   * Multibase encoded public key
   */
  async managementKey() {
    console.log('keyring', this.#keyring)
    const compressedPubKey = this.#keyring._getKeys().managementKey.publicKey
    return secp256k1PubKeyFromCompressed(compressedPubKey)
  }

  signingKey() {
    const compressedPubKey = this.#keyring._getKeys().signingKey.publicKey
    return secp256k1PubKeyFromCompressed(compressedPubKey)
  }

  asymEncryptionKey() {
    const publicKey = this.#keyring._getKeys().asymEncryptionKey.publicKey
    // x25519 public
    const encoded = multicodec.addPrefix(Buffer.from('ec', 'hex'), publicKey)
    return tPromise.decode(PublicKey.codec, encoded)
  }
}
