import IdentityWallet from "identity-wallet";
import { KeyPrecious } from './key-precious';
import * as _ from 'lodash'
import * as multicodec from 'multicodec';
import * as tPromise from 'io-ts-promise';
import { PublicKey } from './public-key';
import { ethers } from 'ethers';
import { PublicKeyMulticodecCodec } from './public-key.multicodec.codec';

function secp256k1PubKeyFromCompressed(compressedHex: string) {
  const publicKey = ethers.utils.computePublicKey('0x' + compressedHex.replace('0x',''))
  const asBuffer = Buffer.from(publicKey.replace('0x04', ''), 'hex')
  // It is secp256k1 public key
  const encoded = multicodec.addPrefix(Buffer.from('e7', 'hex'), asBuffer)
  return tPromise.decode(PublicKeyMulticodecCodec, encoded)
}

export class LocalUser {
  #keyPrecious: KeyPrecious

  constructor(keyPrecious: KeyPrecious) {
    this.#keyPrecious = keyPrecious
  }

  get keyPrecious() {
    return this.#keyPrecious
  }

  static async fromIdentityWallet(identityWallet: IdentityWallet) {
    const provider = identityWallet.get3idProvider();
    const response = await provider.send({
      jsonrpc: '2.0',
      id: Math.floor(Math.random() * 10000),
      method: '3id_authenticate',
      params: { mgmtPub: true },
    });
    const signingKey = await secp256k1PubKeyFromCompressed(response.result.main.signingKey)
    const managementKey = await secp256k1PubKeyFromCompressed(response.result.main.managementKey)
    const encryptionKeyBuffer = Buffer.from(response.result.main.asymEncryptionKey, 'base64')
    const encoded = multicodec.addPrefix(Buffer.from('ec', 'hex'), encryptionKeyBuffer)
    const encr = await tPromise.decode(PublicKeyMulticodecCodec, encoded)
    console.log('encr', encr)



    await identityWallet.getLink();
    const keyring = identityWallet._keyring
    const keyPrecious = KeyPrecious.fromKeyring(keyring)
    return new LocalUser(keyPrecious)
  }

  /**
   * Sign with management key
   */
  signManagement(record: any) {
    const activeRecord = _.cloneDeep(record)
    console.log(activeRecord)
  }
}
