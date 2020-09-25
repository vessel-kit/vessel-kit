import { AlgorithmKind } from './algorithm-kind';
import { InvalidAlgorithmKindError } from './invalid-algorithm-kind.error';
import { Identifier } from './identifier';
import { BytesMultibaseCodec } from '@vessel-kit/codec';
import { DIDDocument, ParsedDID } from 'did-resolver';
import * as f from 'fp-ts';
import { IPublicKey } from './public-key.interface';
import { PublicKeyStringCodec } from './public-key.string.codec';

const METHOD = 'key';

const hexCodec = BytesMultibaseCodec('base16');
const base58btcCodec = BytesMultibaseCodec('base58btc');

export function didDocument(publicKey: IPublicKey): any {
  const fingerprint = PublicKeyStringCodec.encode(publicKey);
  const identifier = new Identifier(METHOD, fingerprint);
  const keyId = `${identifier}#${fingerprint}`;
  switch (publicKey.kind) {
    case AlgorithmKind.secp256k1:
      return {
        id: identifier.toString(),
        '@context': 'https://w3id.org/did/v1',
        publicKey: [
          {
            id: keyId,
            type: 'Secp256k1VerificationKey2018',
            controller: identifier.toString(),
            publicKeyHex: hexCodec.encode(publicKey.material),
          },
        ],
        authentication: [keyId],
        assertionMethod: [keyId],
        capabilityDelegation: [keyId],
        capabilityInvocation: [keyId],
      };
    case AlgorithmKind.ed25519:
      return {
        id: identifier.toString(),
        '@context': 'https://w3id.org/did/v1',
        publicKey: [
          {
            id: keyId,
            type: 'Ed25519VerificationKey2018',
            controller: identifier.toString(),
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
