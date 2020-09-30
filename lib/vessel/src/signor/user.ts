import * as multicodec from 'multicodec';
import * as multibase from 'multibase';
import { ethers } from 'ethers';
import { IProvider } from './provider.interface';
import { IdentityProviderWrap } from './identity-provider.wrap';
import jose from 'jose';
import { JWKMulticodecCodec } from './jwk.multicodec.codec';
import { decodeThrow } from '@vessel-kit/codec';
import { JWTPayload } from './jwt-payload';
import { ISignor } from './signor.interface';
import { sortKeys } from '../util/sort-keys';
import * as hex from '@stablelib/hex';
import { Identifier } from "@vessel-kit/identity";

function secp256k1PubKeyFromCompressed(compressedHex: string) {
  const publicKey = ethers.utils.computePublicKey('0x' + compressedHex.replace('0x', ''));
  const bytes = hex.decode(publicKey.replace('0x04', ''));
  // It is secp256k1 public key
  const encoded = multicodec.addPrefix(Uint8Array.from([0xe7]), bytes);
  return decodeThrow(JWKMulticodecCodec, encoded);
}

async function x25519publicKey(base64: string) {
  const bytes = multibase.decode('M' + base64)
  const encoded = multicodec.addPrefix(Uint8Array.from([0xec]), bytes);
  return decodeThrow(JWKMulticodecCodec, encoded);
}

export class EmptyDIDSigningError extends Error {}

export class User implements ISignor {
  readonly #identityProvider: IdentityProviderWrap;
  #publicKeys: Record<string, jose.JWK.Key>;
  #did?: Identifier;

  constructor(identityProvider: IProvider) {
    this.#identityProvider = new IdentityProviderWrap(identityProvider);
    this.#publicKeys = {};
  }

  async publicKeys(): Promise<Record<string, jose.JWK.Key>> {
    return this.#publicKeys;
  }

  async did(value?: Identifier): Promise<Identifier | undefined> {
    if (value) {
      this.#did = value;
    }
    return this.#did;
  }

  async auth(): Promise<void> {
    const result = await this.#identityProvider.authenticate({ mgmtPub: true });
    const mainKeys = result.main;
    const signingKey = await secp256k1PubKeyFromCompressed(mainKeys.signingKey);
    const managementKey = await secp256k1PubKeyFromCompressed(mainKeys.managementKey);
    const asymEncryptionKey = await x25519publicKey(mainKeys.asymEncryptionKey);
    this.#publicKeys = {
      signingKey: signingKey,
      managementKey: managementKey,
      asymEncryptionKey: asymEncryptionKey,
    };
  }

  static async build(identityProvider: IProvider) {
    const signor = new User(identityProvider);
    await signor.auth();
    return signor;
  }

  async sign(payload: any, opts: { useMgmt: boolean } = { useMgmt: false }): Promise<JWTPayload> {
    const did = await this.did();
    if (!did) throw new EmptyDIDSigningError(`Can not sign payload without DID`);
    payload.iss = did;
    payload.iat = undefined; // did-jwt is quite opinionated
    const sortedPayload = sortKeys(payload);
    const claimParams = { payload: sortedPayload, did: did.toString(), useMgmt: opts.useMgmt };
    const jwtComponents = await this.#identityProvider.signClaim(claimParams);
    const header = jwtComponents.header;
    const signature = jwtComponents.signature;
    return { header, payload, signature };
  }
}
