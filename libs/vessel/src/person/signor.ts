import * as multicodec from 'multicodec';
import * as tPromise from 'io-ts-promise';
import { PublicKey } from './public-key';
import { ethers } from 'ethers';
import sortKeys from 'sort-keys'
import { decodeJWT } from 'did-jwt';

interface JWTHeader {
  typ: 'JWT'
  alg: string
  [x: string]: any
}

interface JWTDecoded {
  header: JWTHeader
  payload: JWTPayload
  signature: string
  data: string
}

interface JWTPayload {
  iss?: string
  sub?: string
  aud?: string | string[]
  iat?: number
  nbf?: number
  type?: string
  exp?: number
  rexp?: number
  [x: string]: any
}

interface IdentityProvider {
  send<A = any>(payload: any, origin?: any, callback?: any): Promise<any>;
}

function openRpcCall(method: string, params: any) {
  return {
    jsonrpc: '2.0',
    id: Math.floor(Math.random() * 10000),
    method,
    params
  }
}

function secp256k1PubKeyFromCompressed(compressedHex: string) {
  const publicKey = ethers.utils.computePublicKey('0x' + compressedHex.replace('0x',''))
  const asBuffer = Buffer.from(publicKey.replace('0x04', ''), 'hex')
  // It is secp256k1 public key
  const encoded = multicodec.addPrefix(Buffer.from('e7', 'hex'), asBuffer)
  return tPromise.decode(PublicKey.codec, encoded)
}

async function x25519publicKey(base64: string) {
  const encryptionKeyBuffer = Buffer.from(base64, 'base64')
  const encoded = multicodec.addPrefix(Buffer.from('ec', 'hex'), encryptionKeyBuffer)
  return tPromise.decode(PublicKey.codec, encoded)
}

interface AuthenticateResponse {
    main: {
      signingKey: string,
      managementKey: string,
      asymEncryptionKey: string
    }
}

export class EmptyDIDSigningError extends Error {
}

export class Signor {
  readonly #identityProvider: IdentityProvider
  #publicKeys: Record<string, PublicKey>
  #did?: string

  constructor(identityProvider: IdentityProvider) {
    this.#identityProvider = identityProvider
    this.#publicKeys = {}
  }

  get publicKeys () {
    return this.#publicKeys
  }

  get did() {
   return this.#did
  }

  set did(value: string) {
    this.#did = value
  }

  async auth(): Promise<void> {
    const result = await this.ask<AuthenticateResponse>('3id_authenticate', {mgmtPub: true})
      const mainKeys = result.main
      const signingKey = await secp256k1PubKeyFromCompressed(mainKeys.signingKey)
      const managementKey = await secp256k1PubKeyFromCompressed(mainKeys.managementKey)
      const asymEncryptionKey = await x25519publicKey(mainKeys.asymEncryptionKey)
      this.#publicKeys = {
        signingKey: signingKey,
        managementKey: managementKey,
        asymEncryptionKey: asymEncryptionKey
    }
  }

  async sign (payload: any, opts: { useMgmt: boolean } = {useMgmt: false}) {
    if (!this.did) throw new EmptyDIDSigningError(`Can not sign payload without DID`)
    payload.iss = this.did
    payload.iat = undefined // did-jwt is quite opinionated
    const sortedPayload = sortKeys(payload, {deep: true})
    const claimParams = { payload: sortedPayload, did: this.did, useMgmt: opts.useMgmt }
    const jwt = await this.ask<string>('3id_signClaim', claimParams)
    const jwtComponents = decodeJWT(jwt) as JWTDecoded
    const header = jwtComponents.header
    const signature = jwtComponents.signature
    return {header, payload, signature}
  }

  async ask<A>(method: string, params: any): Promise<A> {
    const response = await this.#identityProvider.send<A>(openRpcCall(method, params))
    if (response.errors) {
      throw new Error(`Got errors: ${JSON.stringify(response.errors)}`)
    } else {
      return response.result
    }
  }
}
