import * as f from 'fp-ts';
import { ISignerIdentified } from '../signing';
import { Base64urlCodec, decodeThrow } from '@vessel-kit/codec';
import { extractPublicKeys, IResolver, VerificationRelation } from './resolver';
import { verifySignature } from '../verify-signature';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const asBase64Url = f.function.flow(JSON.stringify, textEncoder.encode.bind(textEncoder), Base64urlCodec.encode);
const bytesToJSON = f.function.flow(textDecoder.decode.bind(textDecoder), JSON.parse);

export class InvalidHeaderError extends Error {}

export function signingInput(payload: object, header: JWSDecodedHeader) {
  const appliedPayload = asBase64Url(payload);
  const appliedHeader = asBase64Url({
    alg: header.alg,
    kid: header.kid,
  });
  return `${appliedHeader}.${appliedPayload}`;
}

export async function create(signer: ISignerIdentified, payload: object): Promise<string> {
  const toSign = signingInput(payload, {
    alg: signer.alg,
    kid: signer.kid,
  });
  const signature = await signer.sign(textEncoder.encode(toSign));
  const signatureEncoded = Base64urlCodec.encode(signature);
  return `${toSign}.${signatureEncoded}`;
}

const JWS_PATTERN = /^([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)$/;

export class InvalidJWSError extends Error {}

export interface JWSDecodedHeader {
  alg: string;
  kid: string;
}

export interface JWSDecoded {
  header: JWSDecodedHeader;
  payload: any;
  signature: Uint8Array;
}

export function decode(jws: string): JWSDecoded {
  const match = jws.match(JWS_PATTERN);
  if (match) {
    const header = bytesToJSON(decodeThrow(Base64urlCodec, match[1]));
    if (!header.alg) throw new InvalidJWSError(`Missing alg header`);
    if (!header.kid) throw new InvalidJWSError(`Missing kid header`);
    return {
      header: header,
      payload: bytesToJSON(decodeThrow(Base64urlCodec, match[2])),
      signature: decodeThrow(Base64urlCodec, match[3]),
    };
  } else {
    throw new InvalidJWSError(`Wrong format`);
  }
}

export async function verify(jws: string, resolver: IResolver): Promise<boolean> {
  const decoded = decode(jws);
  const kid = decoded.header.kid;
  const didDocument = await resolver.resolve(kid);
  if (didDocument) {
    const publicKeys = extractPublicKeys(didDocument, VerificationRelation.authentication, kid);
    const input = signingInput(decoded.payload, decoded.header);
    const message = textEncoder.encode(input);
    return publicKeys.some((p) => verifySignature(p, message, decoded.signature));
  } else {
    return false;
  }
}
