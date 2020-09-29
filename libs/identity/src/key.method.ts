import { AlgorithmKind } from './algorithm-kind';
import { InvalidAlgorithmKindError } from './invalid-algorithm-kind.error';
import { Identifier } from './identifier';
import { BytesUnbaseCodec } from '@vessel-kit/codec';
import { DIDDocument, ParsedDID } from 'did-resolver';
import * as f from 'fp-ts';
import { IPublicKey } from './public-key.interface';
import { PublicKeyStringCodec } from './public-key.string.codec';
import { IPrivateKey, ISigner, ISignerIdentified } from './private-key.interface';

const METHOD = 'key';

const hexCodec = BytesUnbaseCodec('base16');
const base58btcCodec = BytesUnbaseCodec('base58btc');

export function identifier(publicKey: IPublicKey) {
  const fingerprint = PublicKeyStringCodec.encode(publicKey);
  return new Identifier(METHOD, fingerprint);
}

export function kid(publicKey: IPublicKey) {
  const id = identifier(publicKey);
  return `${id}#${id.id}`;
}

export class SignerIdentified implements ISignerIdentified {
  readonly alg = this.signer.alg;
  readonly sign = this.signer.sign.bind(this.signer);

  static async fromPrivateKey(privateKey: IPrivateKey & ISigner) {
    const publicKey = await privateKey.publicKey();
    const keyId = kid(publicKey);
    return new SignerIdentified(privateKey, keyId);
  }

  constructor(private readonly signer: ISigner, readonly kid: string) {}
}

export function didDocument(publicKey: IPublicKey): any {
  const id = identifier(publicKey).toString();
  const keyId = kid(publicKey);
  switch (publicKey.kind) {
    case AlgorithmKind.ES256K:
      return {
        id: id,
        '@context': 'https://w3id.org/did/v1',
        publicKey: [
          {
            id: keyId,
            type: 'Secp256k1VerificationKey2018',
            controller: id,
            publicKeyHex: hexCodec.encode(publicKey.material),
          },
        ],
        authentication: [keyId],
        assertionMethod: [keyId],
        capabilityDelegation: [keyId],
        capabilityInvocation: [keyId],
      };
    case AlgorithmKind.Ed25519:
      return {
        id: id,
        '@context': 'https://w3id.org/did/v1',
        publicKey: [
          {
            id: keyId,
            type: 'Ed25519VerificationKey2018',
            controller: id,
            publicKeyBase58: base58btcCodec.encode(publicKey.material),
          },
        ],
        authentication: [keyId],
        assertionMethod: [keyId],
        capabilityDelegation: [keyId],
        capabilityInvocation: [keyId],
      };
    default:
      throw new InvalidAlgorithmKindError(publicKey.kind);
  }
}

export function getResolver() {
  const asDocument = f.function.flow(
    PublicKeyStringCodec.decode,
    f.either.map(didDocument),
    f.either.fold(f.either.throwError, f.function.identity),
  );
  const resolve = async (did: string, parsed: ParsedDID): Promise<DIDDocument> => asDocument(parsed.id);

  return { key: resolve };
}

export const KeyMethod = { getResolver };
