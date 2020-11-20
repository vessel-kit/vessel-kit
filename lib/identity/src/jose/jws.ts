/**
 * Manipulate JWS signatures.
 *
 * Most important functions are [[create]] and [[verify]].
 *
 * @example
 * ```ts
 * import { PrivateKeyFactory, AlgorithmKind, KeyMethod, jws } from '@vessel-kit/identity';
 * import { Resolver } from 'did-resolver';
 *
 * const privateKeyFactory = new PrivateKeyFactory();
 * const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, 'seed');
 * const signer = await KeyMethod.SignerIdentified.fromPrivateKey(privateKey);
 * const signature = await jws.create(signer, { hello: 'world' });
 * const resolver = new Resolver({
 *    ...KeyMethod.getResolver(),
 * });
 * const isVerified = await jws.verify(signature, resolver); // Expect true.
 * ```
 *
 * @packageDocumentation
 */

import * as f from "fp-ts";
import { ISignerIdentified } from "../private-key.interface";
import {
  Base64urlCodec,
  decodeThrow,
  BytesMultibaseCodec,
} from "@vessel-kit/codec";
import { extractPublicKeys, IResolver, VerificationRelation } from "./resolver";
import { AlgorithmKind } from "../algorithm-kind";
import * as _ from "lodash";
import stringify from "fast-json-stable-stringify";
import CID from "cids";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const isBinary = (input: unknown): input is ArrayBuffer | ArrayBufferView =>
  input instanceof ArrayBuffer || ArrayBuffer.isView(input);
const coerceBinary = (o: ArrayBufferView | ArrayBuffer) => {
  if (o instanceof Uint8Array && o.constructor.name === "Uint8Array") return o;
  if (o instanceof ArrayBuffer) return new Uint8Array(o);
  if (ArrayBuffer.isView(o)) {
    return new Uint8Array(o.buffer, o.byteOffset, o.byteLength);
  }
  throw new Error("Unknown type, must be binary type");
};
const linkify = (obj: Record<string, any>) =>
  _.transform(obj, (result: any, value, key) => {
    const cid = CID.isCID(value);
    if (cid) {
      result[key] = { "/": value.toString() };
    } else if (isBinary(value)) {
      value = coerceBinary(value);
      result[key] = {
        "/": { bytes: BytesMultibaseCodec("base64").encode(value) },
      };
    } else if (typeof value === "object" && value !== null) {
      result[key] = linkify(value);
    } else {
      result[key] = value;
    }
  });
const unlinkify = (obj: Record<string, any>) =>
  _.transform(obj, (result: any, value, key) => {
    if (typeof value === "object" && value !== null) {
      if (value["/"]) {
        if (typeof value["/"] === "string") {
          result[key] = new CID(value["/"]);
        } else if (typeof value["/"] === "object" && value["/"].bytes) {
          result[key] = decodeThrow(
            BytesMultibaseCodec("base64"),
            value["/"].bytes
          );
        } else {
          result[key] = unlinkify(value);
        }
      } else {
        result[key] = unlinkify(value);
      }
    } else {
      result[key] = value;
    }
  });
const asBase64Url = f.function.flow(
  linkify,
  stringify,
  textEncoder.encode.bind(textEncoder),
  Base64urlCodec.encode
);
const bytesToJSON = f.function.flow(
  textDecoder.decode.bind(textDecoder),
  JSON.parse,
  unlinkify
);

/**
 * Create JSON Web signature, in compact form, that is "<header>.<payload>.<signature>" string.
 * Header is built in form `{alg: <algorithm>, kid: <key-id>}`, where `<key-id>` is DID URL.
 * This way we could determine the signing key when verifying the signature.
 *
 * @category Signing
 * @param signer Signer that could report its DID key id.
 * @param payload JSON payload to sign.
 */
export async function create(
  signer: ISignerIdentified,
  payload: object
): Promise<string> {
  const toSign = signingInput(payload, {
    alg: signer.alg,
    kid: signer.kid,
  });
  const signature = await signer.sign(textEncoder.encode(toSign));
  const signatureEncoded = Base64urlCodec.encode(signature);
  return toSign + "." + signatureEncoded;
}

/**
 * Create JSON Web signature embedded into the payload, similar to Enveloped XML Signature.
 *
 * @category Signing
 * @param signer Signer that could report its DID key id.
 * @param payload JSON payload to sign.
 */
export async function createEnveloped<A extends object>(
  signer: ISignerIdentified,
  payload: A
): Promise<A & { signature: string }> {
  const signature = await create(signer, payload);
  const detached = asDetached(signature);
  return Object.assign({}, payload, { signature: detached });
}

/**
 * Prepare signing input: `base64url(header).base64url(payload)`. Called by [[create]] internally.
 *
 * @param payload Any json object.
 * @param header
 * @internal
 * @ignore
 * @category Ancillary
 */
export function signingInput(payload: object, header: JWSDecodedHeader) {
  const appliedPayload = asBase64Url(payload);
  const appliedHeader = asBase64Url({
    alg: header.alg,
    kid: header.kid,
  });
  return appliedHeader + "." + appliedPayload;
}

/**
 * Prepare verification input. Called by and [[verify]] internally.
 *
 * @param jws JWS Compact serialization.
 * @internal
 * @ignore
 * @category Ancillary
 */
export function verificationInput(jws: string) {
  return jws.replace(/\.[a-zA-Z0-9_-]+$/, "");
}

const JWS_PATTERN = /^([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]*)\.([a-zA-Z0-9_-]+)$/;

/**
 * JWS could not be properly parsed.
 */
export class InvalidJWSError extends Error {}

/**
 * JWS Header. Necessary to verify signature later.
 */
export interface JWSDecodedHeader {
  /**
   * Algorithm used.
   * @see [[AlgorithmKind]] for supported algorithms.
   */
  alg: AlgorithmKind;
  /**
   * DID URL to a key used for signing, or DID identifier. Used to get a key or set of keys to verify signature against.
   * @see [[verify]]
   */
  kid: string;
}

/**
 * JWS suitable for manipulation.
 *
 * **Attention:** This is not [general](https://tools.ietf.org/html/rfc7515#section-7.2.1)
 * or [flattened](https://tools.ietf.org/html/rfc7515#section-7.2.2) JWS JSON Serialization.
 */
export interface JWSDecoded {
  /**
   * JWS Header.
   */
  header: JWSDecodedHeader;
  /**
   * JWS Payload. Expect JSON object.
   */
  payload: any;
  /**
   * Signature bytes.
   */
  signature: Uint8Array;
}

/**
 * Split JWS compact serialization into three parts.
 *
 * @param jws JWS in compact serialization.
 * @category Serialization
 * @throws InvalidJWSError
 * @internal
 */
export function splitParts(jws: string): RegExpMatchArray {
  const match = jws.match(JWS_PATTERN);
  if (match) {
    return match;
  } else {
    throw new InvalidJWSError(`Wrong format`);
  }
}

/**
 * Decode JWS Compact serialization into form suitable for manipulation.
 * Decodes header into proper `{alg: <algorithm>, kid: <key-id>}` object.
 * Decodes payload into proper JSON object.
 * Decodes signature from base64url encoded string into proper `Uint8Array` bytes.
 *
 * **NB** JWS payload could be anything. Here it is assumed payload is JSON object. Anything else would trigger error.
 *
 * @param jws JWS in compact serialization
 * @category Serialization
 * @throws InvalidJWSError
 */
export function decode(jws: string): JWSDecoded {
  const match = splitParts(jws);
  const header = bytesToJSON(decodeThrow(Base64urlCodec, match[1]));
  if (!header.alg) throw new InvalidJWSError(`Missing alg header`);
  if (!header.kid) throw new InvalidJWSError(`Missing kid header`);
  return {
    header: {
      alg: AlgorithmKind.fromString(header.alg),
      kid: header.kid,
    },
    payload: bytesToJSON(decodeThrow(Base64urlCodec, match[2])),
    signature: decodeThrow(Base64urlCodec, match[3]),
  };
}

/**
 * Verify JWS against key specified in `kid` header. `kid` contains DID URL to the key, or DID identifier.
 * The function resolves the DID, extracts the keys and checks the signature against them.
 * If `kid` is DID URL to the key (`did:key:z6DtMrg4Kv51UMAM8vJcCLcRywJfEB4dpHVxPCR6qm6hSV3N#z6DtMrg4Kv51UMAM8vJcCLcRywJfEB4dpHVxPCR6qm6hSV3N`),
 * only this key is used. If `kid` is DID identifier (`did:key:z6DtMrg4Kv51UMAM8vJcCLcRywJfEB4dpHVxPCR6qm6hSV3N`), all keys in `authentication`
 * verification relation are used. Verification succeeds if at least one key matches.
 *
 * @category Signing
 * @param jws JSON Web Signature in compact form.
 * @param resolver DID Resolver.
 */
export async function verify(
  jws: string,
  resolver: IResolver
): Promise<boolean> {
  const decoded = decode(jws);
  const kid = decoded.header.kid;
  const didDocument = await resolver.resolve(kid);
  const publicKeys = extractPublicKeys(
    didDocument,
    VerificationRelation.authentication,
    kid,
    decoded.header.alg
  );
  const input = verificationInput(jws);
  const message = textEncoder.encode(input);
  const verifications = await Promise.all(
    publicKeys.map((p) => p.verify(message, decoded.signature))
  );
  return verifications.some(f.function.identity);
}

/**
 * Transform JWS compact serialization into [Detached Content](https://tools.ietf.org/html/rfc7515#appendix-F) form.
 * Replace payload part with empty string.
 *
 * @param jws JWS compact serialization.
 * @return JWS detached form.
 * @category Detached Content
 */
export function asDetached(jws: string): string {
  const parts = splitParts(jws);
  return parts[1] + ".." + parts[3];
}

/**
 * Transform JWS [detached form](https://tools.ietf.org/html/rfc7515#appendix-F) into compact serialization by inserting
 * base64url-encoded payload back.

 * @see [[asDetached]]
 * @param payload JSON object of payload to insert.
 * @param detached JWS detached form.
 * @category Detached Content
 */
export function asAttached(payload: object, detached: string): string {
  const parts = splitParts(detached);
  const appliedPayload = asBase64Url(payload);
  return parts[1] + "." + appliedPayload + "." + parts[3];
}

/**
 * Check if passed JWS is in detached form.
 *
 * @category Detached Content
 * @param jws JWS in either compact serialization or detached form.
 */
export function isDetached(jws: string) {
  const parts = splitParts(jws);
  return parts[2] === "";
}

/**
 * Check if passed JWS is in compact serialization, that is not detached.
 *
 * @category Detached Content
 * @param jws JWS in either compact serialization or detached form.
 */
export function isAttached(jws: string): boolean {
  return !isDetached(jws);
}
