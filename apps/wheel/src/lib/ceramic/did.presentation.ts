import { ThreeId } from "./three-id";

const METHOD = "3";

export class DidPresentation {
  readonly id = `did:${METHOD}:${this.document.id}`;
  constructor(private readonly document: ThreeId) {}

  toJSON() {
    const document: any = {
      "@context": "https://w3id.org/did/v1",
      id: this.id
    };
    if (this.document.publicKeys.size) {
      document.publicKey = [];
      this.document.publicKeys.forEach((key, id) => {
        document.publicKey.push({
          id: `${this.id}#${id}`,
          type: "JwsVerificationKey2020",
          publicKeyJwk: key
        });
      });
    }
    if (this.document.publicKeys.get("signing")) {
      document.authentication = [
        {
          type: "Secp256k1SignatureAuthentication2018",
          publicKey: `${this.id}#signing`
        }
      ];
    }
    return document;
  }
}
