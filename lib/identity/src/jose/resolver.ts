import * as didResolver from "did-resolver";
import { BytesUnbaseCodec, decodeThrow } from "@vessel-kit/codec";
import * as ES256K from "../algorithms/ES256K";
import * as Ed25519 from "../algorithms/EdDSA";
import { DidUrl } from "../did-url";
import { AlgorithmKind } from "../algorithm-kind";
import { IPublicKey } from "../public-key.interface";

/**
 * Aspect of [DIDResolver](https://github.com/decentralized-identity/did-resolver). Resolve DID document by DID.
 */
export interface IResolver {
  /**
   * Resolve DID document by DID or throw an error if no document found.
   * @param did DID identifier or DID URL.
   */
  resolve(did: string): Promise<didResolver.DIDDocument>;
}

const base16 = BytesUnbaseCodec("base16");
const base58btc = BytesUnbaseCodec("base58btc");

export class UnsupportedKeyEncodingError extends Error {}

export function keyMaterialFromDID(entry: didResolver.PublicKey) {
  if (entry.publicKeyBase58) {
    return decodeThrow(base58btc, entry.publicKeyBase58);
  } else if (entry.publicKeyHex) {
    return decodeThrow(base16, entry.publicKeyHex);
  } else {
    throw new UnsupportedKeyEncodingError(
      `Unsupported key encoding for ${entry.id}`
    );
  }
}

export class UnknownKeyTypeError extends Error {}

export type SupportedPublicKey = ES256K.PublicKey | Ed25519.PublicKey;

export function publicKeyFromDID(
  entry: didResolver.PublicKey
): SupportedPublicKey {
  const material = keyMaterialFromDID(entry);
  switch (entry.type) {
    case "Secp256k1VerificationKey2018":
    case "EcdsaPublicKeySecp256k1":
    case "Secp256k1SignatureVerificationKey2018":
    case "Secp256k1SignatureAuthentication2018":
      return new ES256K.PublicKey(material);
    case "Curve25519EncryptionPublicKey":
    case "ED25519SignatureVerification":
    case "Ed25519VerificationKey2018":
      return new Ed25519.PublicKey(material);
    default:
      throw new UnknownKeyTypeError(`Unknown key type ${entry.type}`);
  }
}

export enum VerificationRelation {
  authentication = "authentication",
  keyAgreement = "keyAgreement",
}

const isRelationProper = (
  didDocument: didResolver.DIDDocument,
  relation: VerificationRelation
) => (publicKey: didResolver.PublicKey) => {
  const relationEntries = ((didDocument[relation] || []) as unknown) as any[];
  const linksFromStrings = relationEntries.filter<string>(
    (value): value is string => typeof value === "string"
  );
  const linksFromAuthentication = relationEntries.map((value: any) => {
    return value.publicKey;
  });
  return (
    linksFromStrings.includes(publicKey.id) ||
    linksFromAuthentication.includes(publicKey.id)
  );
};

const isKidProper = (kid: string) => (publicKey: didResolver.PublicKey) => {
  const didUrl = decodeThrow(DidUrl.asString, kid);
  if (didUrl.fragment) {
    return (
      publicKey.id === kid ||
      publicKey.id.substring(0, publicKey.id.indexOf("#")) ===
        kid.substring(0, kid.indexOf("?"))
    );
  } else {
    return true;
  }
};

const isAlgProper = (alg: AlgorithmKind) => (publicKey: IPublicKey) => {
  return publicKey.alg === alg;
};

/**
 * Extract public keys from DID Document
 *
 * @param didDocument DID Document as per [DID Core](https://w3c.github.io/did-core/) specification.
 * @param relation verification relation section of the DID Document.
 * @param kid DID URL of the key. Could be just DID identifier.
 * @param alg Algorithm used.
 */
export function extractPublicKeys(
  didDocument: didResolver.DIDDocument,
  relation: VerificationRelation,
  kid: string,
  alg: AlgorithmKind
): SupportedPublicKey[] {
  const allPublicKeys = didDocument.publicKey;

  const byRelation = isRelationProper(didDocument, relation);
  const byKid = isKidProper(kid);

  const relationPublicKeysRaw = allPublicKeys.filter(
    (p) => byRelation(p) && byKid(p)
  );
  return relationPublicKeysRaw.map(publicKeyFromDID).filter(isAlgProper(alg));
}
