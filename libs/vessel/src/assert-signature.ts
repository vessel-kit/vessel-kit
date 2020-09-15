import { DIDDocument } from 'did-resolver';
import { InvalidSignatureError } from './invalid-signature.error';
import _ from 'lodash';
import { sortKeys } from './util/sort-keys';
import * as didJwt from 'did-jwt';
import { Uint8ArrayBase64StringCodec } from "@vessel-kit/codec";

export interface Resolvable {
  resolve: (did: string) => Promise<DIDDocument | null>;
}

export async function assertSignature(record: any, resolvable: Resolvable): Promise<void> {
  const payloadObject = _.omit(record, ['header', 'signature']);
  payloadObject.prev = payloadObject.prev ? { '/': payloadObject.prev.toString() } : undefined;
  payloadObject.id = payloadObject.id ? { '/': payloadObject.id.toString() } : undefined;

  // TODO Check signor
  // if (!(payloadObject.owners as string[]).includes(payloadObject.iss)) {
  //   throw new InvalidSignatureError(`Invalid issuer`);
  // }

  const encoder = new TextEncoder(); // TODO Encode/decode codec: make it functional
  const encodedPayload = Uint8ArrayBase64StringCodec.encode(encoder.encode(JSON.stringify(sortKeys(payloadObject))));
  const header = { typ: record.header.typ, alg: record.header.alg };
  const encodedHeader = Uint8ArrayBase64StringCodec.encode(encoder.encode(JSON.stringify(header)));
  const encodedSignature = record.signature;
  const jwt = [encodedHeader, encodedPayload, encodedSignature].join('.');

  try {
    await didJwt.verifyJWT(jwt, { resolver: resolvable });
  } catch (e) {
    console.error(e)
    throw new InvalidSignatureError(e.message);
  }
}
