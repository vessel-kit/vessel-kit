import { AlgorithmKind } from './algorithm-kind';
import { InvalidAlgorithmKindError } from './invalid-algorithm-kind.error';
import { Identifier } from './identifier';
import { BytesMultibaseCodec, BytesUnbaseCodec } from '@vessel-kit/codec';
import { DIDDocument, DIDResolver, ParsedDID } from 'did-resolver';
import * as f from 'fp-ts';
import { IPublicKey } from './public-key.interface';
import { IPrivateKey, ISigner, ISignerIdentified } from './private-key.interface';
import * as t from 'io-ts';
import multicodec from 'multicodec';
import * as ES256K from './algorithms/ES256K';
import * as Ed25519 from './algorithms/EdDSA';

const METHOD = 'key';

const hexCodec = BytesUnbaseCodec('base16');
const base58btcCodec = BytesUnbaseCodec('base58btc');

enum KEY_PREFIX {
  secp256k1 = 0xe7,
  ed25519 = 0xec,
}

/**
 * Codec for IPublicKey ↔ Uint8Array that encodes public key via multicodec.
 */
const PublicKeyMulticodecCodec = new t.Type<IPublicKey, Uint8Array, Uint8Array>(
  'PublicKey-multicodec',
  (p: unknown): p is IPublicKey => {
    if (p && typeof p === 'object') {
      return 'alg' in p && 'material' in p;
    } else {
      return false;
    }
  },
  (bytes, context) => {
    const prefix = multicodec.getCode(bytes);
    switch (prefix) {
      case KEY_PREFIX.secp256k1:
        return t.success(new ES256K.PublicKey(multicodec.rmPrefix(bytes)));
      case KEY_PREFIX.ed25519:
        return t.success(new Ed25519.PublicKey(multicodec.rmPrefix(bytes)));
      default:
        return t.failure(bytes, context, `Invalid prefix ${prefix}`);
    }
  },
  (publicKey) => {
    switch (publicKey.alg) {
      case AlgorithmKind.ES256K:
        return multicodec.addPrefix(Uint8Array.from([KEY_PREFIX.secp256k1]), publicKey.material);
      case AlgorithmKind.EdDSA:
        return multicodec.addPrefix(Uint8Array.from([KEY_PREFIX.ed25519]), publicKey.material);
      /* istanbul ignore next */
      default:
        throw new InvalidAlgorithmKindError(publicKey.alg);
    }
  },
);

/**
 * Codec for IPublicKey ↔ string. Encodes public key via multicodec and serializes the bytes in base58btc.
 *
 * Supports _secp256k1 (ES256K)_ and _ed25519 (EdDSA)_ public keys.
 *
 * @see [did:key method](https://w3c-ccg.github.io/did-method-key/)
 * @see [multicodec](https://github.com/multiformats/multicodec)
 * @see [multibase](https://github.com/multiformats/multibase)
 *
 * @internal
 */
export const PublicKeyStringCodec = BytesMultibaseCodec('base58btc').pipe(PublicKeyMulticodecCodec);

/**
 * Represent [[IPublicKey]] as `did:key` identifier.
 * @internal
 */
export function identifier(publicKey: IPublicKey) {
  const fingerprint = PublicKeyStringCodec.encode(publicKey);
  return new Identifier(METHOD, fingerprint);
}

/**
 * Get key identifier, from representation of [[IPublicKey]] as `did:key` identifier.
 * @internal
 * @example
 * ```
 * did:key:z6LSbk6TfcGsgm1yEUdGxwqscTzF6JkKNfrySPPLYqh8Ti6U#z6LSbk6TfcGsgm1yEUdGxwqscTzF6JkKNfrySPPLYqh8Ti6U
 * ```
 */
export function kid(publicKey: IPublicKey) {
  const id = identifier(publicKey);
  return `${id}#${id.id}`;
}

/**
 * Individual signer (=private key) with key identifier
 * as per [did:key](https://w3c-ccg.github.io/did-method-key/) DID Document presentation.
 */
export class SignerIdentified implements ISignerIdentified {
  /**
   * Identifier of realised [JOSE algorithm](https://www.iana.org/assignments/jose/jose.xhtml#web-signature-encryption-algorithms).
   */
  readonly alg = this.signer.alg;
  /**
   * Sign the payload.
   *
   * @see [[ISigner.sign]]
   */
  readonly sign = this.signer.sign.bind(this.signer);

  /**
   * Calculate [[kid]] based on private key and build [[SignerIdentified]] instance.
   * @param privateKey
   */
  static async fromPrivateKey(privateKey: IPrivateKey & ISigner) {
    const publicKey = await privateKey.publicKey();
    const keyId = kid(publicKey);
    return new SignerIdentified(privateKey, keyId);
  }

  protected constructor(
    /**
     * @ignore
     */
    private readonly signer: ISigner,
    /**
     * @example
     * ```
     * did:key:z6LSbk6TfcGsgm1yEUdGxwqscTzF6JkKNfrySPPLYqh8Ti6U#z6LSbk6TfcGsgm1yEUdGxwqscTzF6JkKNfrySPPLYqh8Ti6U
     * ```
     */
    readonly kid: string,
  ) {}
}

function didDocument(publicKey: IPublicKey): any {
  const id = identifier(publicKey).toString();
  const keyId = kid(publicKey);
  switch (publicKey.alg) {
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
    case AlgorithmKind.EdDSA:
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
    /* istanbul ignore next */
    default:
      throw new InvalidAlgorithmKindError(publicKey.alg);
  }
}

/**
 * Return resolver for [did:key](https://w3c-ccg.github.io/did-method-key/) method,
 * suitable for consumption in [did-resolver](https://github.com/decentralized-identity/did-resolver) package.
 */
export function getResolver(): Record<string, DIDResolver> {
  const asDocument = f.function.flow(
    PublicKeyStringCodec.decode,
    f.either.map(didDocument),
    f.either.fold(f.task.of(null), f.function.identity),
  );
  const resolve = async (did: string, parsed: ParsedDID): Promise<DIDDocument | null> => asDocument(parsed.id);

  return { key: resolve };
}
