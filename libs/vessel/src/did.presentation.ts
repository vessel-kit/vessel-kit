import { JWKMulticodecCodec } from './signor/jwk.multicodec.codec';
import * as jose from 'jose';
import * as multicodec from 'multicodec';
import { ThreeIdFreight } from './doctypes/three-id';
import { DIDDocument, PublicKey } from 'did-resolver';
import { Authentication } from 'did-resolver/src/resolver';

function publicKeyHex(key: jose.JWK.Key): string {
  const multicodecBuffer = JWKMulticodecCodec.encode(key);
  return '04' + multicodec.rmPrefix(multicodecBuffer).toString('hex');
}

function publicKeyBase64(key: jose.JWK.Key): string {
  const multicodecBuffer = JWKMulticodecCodec.encode(key);
  return multicodec.rmPrefix(multicodecBuffer).toString('base64');
}

export class DidPresentation implements DIDDocument {
  readonly id: string;
  readonly '@context' = 'https://w3id.org/did/v1';
  readonly publicKey: PublicKey[] = [];
  readonly authentication: Authentication[] = [];

  constructor(id: string, private readonly document: ThreeIdFreight, useMgmt: boolean = false) {
    this.id = id;
    if (useMgmt) {
      this.document.owners.forEach((ownerKey, i) => {
        this.publicKey.push({
          id: `${this.id}#managementKey_${i}`,
          type: 'Secp256k1VerificationKey2018',
          owner: this.id,
          publicKeyHex: publicKeyHex(ownerKey),
        });
        this.authentication.push({
          type: 'Secp256k1SignatureAuthentication2018',
          publicKey: `${this.id}#managementKey_${i}`,
        });
      });
    } else {
      this.publicKey.push({
        id: `${this.id}#signingKey`,
        type: 'Secp256k1VerificationKey2018',
        owner: this.id,
        publicKeyHex: publicKeyHex(this.document.content.publicKeys.signing),
      });
      this.publicKey.push({
        id: `${this.id}#encryptionKey`,
        type: 'Curve25519EncryptionPublicKey',
        owner: this.id,
        publicKeyBase64: publicKeyBase64(this.document.content.publicKeys.encryption),
      });
      this.authentication.push({
        type: 'Secp256k1SignatureAuthentication2018',
        publicKey: `${this.id}#signingKey`,
      });
    }
  }
}
