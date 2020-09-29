import * as didResolver from 'did-resolver';
import { BytesUnbaseCodec, decodeThrow } from '@vessel-kit/codec';
import * as ES256K from '../algorithms/ES256K';
import * as Ed25519 from '../algorithms/Ed25519';
import { DidUrlStringCodec } from '../did-url';

export interface IResolver {
  resolve(did: string): Promise<didResolver.DIDDocument>;
}

const base16 = BytesUnbaseCodec('base16');
const base58btc = BytesUnbaseCodec('base58btc');

export class UnsupportedKeyEncodingError extends Error {}

export function keyMaterialFromDID(entry: didResolver.PublicKey) {
  if (entry.publicKeyBase58) {
    return decodeThrow(base58btc, entry.publicKeyBase58);
  } else if (entry.publicKeyHex) {
    return decodeThrow(base16, entry.publicKeyHex);
  } else {
    throw new UnsupportedKeyEncodingError(`Unsupported key encoding for ${entry.id}`);
  }
}

export class UnknownKeyTypeError extends Error {}

export type SupportedPublicKey = ES256K.PublicKey | Ed25519.PublicKey;

export function publicKeyFromDID(entry: didResolver.PublicKey): SupportedPublicKey {
  const material = keyMaterialFromDID(entry);
  switch (entry.type) {
    case 'Secp256k1VerificationKey2018':
    case 'EcdsaPublicKeySecp256k1':
    case 'Secp256k1SignatureVerificationKey2018':
      return new ES256K.PublicKey(material);
    case 'ED25519SignatureVerification':
      return new Ed25519.PublicKey(material);
    default:
      throw new UnknownKeyTypeError(`Unknown key type ${entry.type}`);
  }
}

export enum VerificationRelation {
  authentication = 'authentication',
  keyAgreement = 'keyAgreement',
}

export function extractPublicKeys(
  didDocument: didResolver.DIDDocument,
  relation: VerificationRelation,
  kid: string,
): SupportedPublicKey[] {
  const relationEntries = ((didDocument[relation] || []) as unknown) as any[];
  const relationLinks = relationEntries.filter<string>((value): value is string => typeof value === 'string');
  const allPublicKeys = didDocument.publicKey;
  let relationPublicKeysRaw = allPublicKeys.filter((p) => relationLinks.includes(p.id));
  const didUrl = decodeThrow(DidUrlStringCodec, kid);
  if (didUrl.fragment) {
    relationPublicKeysRaw = relationPublicKeysRaw.filter((p) => p.id === kid);
  }
  return relationPublicKeysRaw.map(publicKeyFromDID);
}
