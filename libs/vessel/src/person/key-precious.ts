import Keyring from 'identity-wallet/lib/keyring';
import * as multicodec from 'multicodec';
import { BufferMultibaseCodec, PublicKey } from '..';
import * as tPromise from 'io-ts-promise'
import * as t from 'io-ts'
import { ethers } from 'ethers';

function encodeSecp256k1PubKeyHex(hex: string) {
  const asBuffer = Buffer.from(hex.replace('0x', ''), 'hex')
  return encodeSecp256k1PubKey(asBuffer)
}

function encodeSecp256k1PubKey(pubKey: Buffer) {
  const encoded = multicodec.addPrefix(Buffer.from('e7', 'hex'), pubKey)
  return BufferMultibaseCodec.encode(encoded)
}

function secp256k1PubKeyFromCompressed(compressedHex: string) {
  const publicKey = ethers.utils.computePublicKey(compressedHex)
  const asBuffer = Buffer.from(publicKey.replace('0x04', ''), 'hex')
  // It is secp256k1 public key
  const encoded = multicodec.addPrefix(Buffer.from('e7', 'hex'), asBuffer)
  return tPromise.decode(PublicKey.codec, encoded)
}

export class KeyPrecious {
  #keyring: Keyring
  constructor(seed: string) {
    this.#keyring = new Keyring(seed)
  }

  /**
   * Multibase encoded public key
   */
  async managementKey() {
    const compressedPubKey = this.#keyring._getKeys().managementKey.publicKey
    return secp256k1PubKeyFromCompressed(compressedPubKey)
  }

  signingKey() {
    const compressedPubKey = this.#keyring._getKeys().signingKey.publicKey
    return secp256k1PubKeyFromCompressed(compressedPubKey)
  }

  asymEncryptionKey() {
    const publicKey = this.#keyring._getKeys().asymEncryptionKey.publicKey
    // x25519
    const encoded = multicodec.addPrefix(Buffer.from('ec', 'hex'), publicKey)
    return tPromise.decode(PublicKey.codec, encoded)
  }
}
