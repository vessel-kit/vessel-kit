import { ThreeIdContent } from './three-id.content';
import { JWKMulticodecCodec } from './person/jwk.multicodec.codec';
import * as jose from 'jose';
import * as multicodec from 'multicodec';

function publicKeyHex(key: jose.JWK.Key): string {
  const multicodecBuffer = JWKMulticodecCodec.encode(key);
  return '04' + multicodec.rmPrefix(multicodecBuffer).toString('hex');
}

function publicKeyBase64(key: jose.JWK.Key): string {
  const multicodecBuffer = JWKMulticodecCodec.encode(key);
  return multicodec.rmPrefix(multicodecBuffer).toString('base64');
}

export class DidPresentation {
  private readonly id: string;

  constructor(id: string, private readonly document: ThreeIdContent) {
    // this.id = `did:${METHOD}:${id}`;
    this.id = id;
  }

  toJSON() {
    const document: any = {
      '@context': 'https://w3id.org/did/v1',
      id: this.id,
      publicKey: [
        {
          id: `${this.id}#signingKey`,
          type: 'Secp256k1VerificationKey2018',
          owner: this.id,
          publicKeyHex: publicKeyHex(this.document.publicKeys.get('signing')),
        },
        {
          id: `${this.id}#encryptionKey`,
          type: 'Curve25519EncryptionPublicKey',
          owner: this.id,
          publicKeyBase64: publicKeyBase64(this.document.publicKeys.get('encryption')),
        },
      ],
      authentication: [
        {
          type: 'Secp256k1SignatureAuthentication2018',
          publicKey: `${this.id}#signingKey`,
        },
      ],
    };

    this.document.owners.forEach((ownerKey, i) => {
      document.publicKey.push({
        id: `${this.id}#managementKey_${i}`,
        type: 'Secp256k1VerificationKey2018',
        owner: this.id,
        publicKeyHex: publicKeyHex(ownerKey),
      });
      document.authentication.push({
        type: 'Secp256k1SignatureAuthentication2018',
        publicKey: `${this.id}#managementKey_${i}`,
      });
    });

    return document;
  }
}
