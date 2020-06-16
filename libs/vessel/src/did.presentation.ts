import { ThreeIdContent } from './three-id.content';

const METHOD = '3';

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
          publicKeyHex:
            '04' +
            this.document.publicKeys
              .get('signing')
              .raw()
              .toString('hex'),
        },
        {
          id: `${this.id}#encryptionKey`,
          type: 'Curve25519EncryptionPublicKey',
          owner: this.id,
          publicKeyBase64: this.document.publicKeys
            .get('encryption')
            .raw()
            .toString('base64'),
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
        publicKeyHex: '04' + ownerKey.raw().toString('hex'),
      });
      document.authentication.push({
        type: 'Secp256k1SignatureAuthentication2018',
        publicKey: `${this.id}#managementKey_${i}`,
      });
    });

    // FFS
    // if (this.document.publicKeys.size) {
    //   document.publicKey = [];
    //   this.document.publicKeys.forEach((key, id) => {
    //     document.publicKey.push({
    //       id: `${this.id}#${id}`,
    //       type: "JwsVerificationKey2020",
    //       publicKeyJwk: key
    //     });
    //   });
    // }
    // if (this.document.publicKeys.get("signing")) {
    //   document.authentication = [
    //     {
    //       type: "Secp256k1SignatureAuthentication2018",
    //       publicKey: `${this.id}#signing`
    //     }
    //   ];
    // }
    return document;
  }
}
