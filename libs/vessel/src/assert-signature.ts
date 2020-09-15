import { DIDDocument } from 'did-resolver';
import { InvalidSignatureError } from './invalid-signature.error';
import _ from 'lodash';
import { sortKeys } from './util/sort-keys';
import * as didJwt from 'did-jwt';
import { Base64urlCodec } from '@vessel-kit/codec';

export interface Resolvable {
  resolve: (did: string) => Promise<DIDDocument | null>;
}

const textEncoder = new TextEncoder();

export async function assertSignature(record: any, resolvable: Resolvable): Promise<void> {
  const payloadObject = _.omit(record, ['header', 'signature']);
  payloadObject.prev = payloadObject.prev ? { '/': payloadObject.prev.toString() } : undefined;
  payloadObject.id = payloadObject.id ? { '/': payloadObject.id.toString() } : undefined;

  // TODO Check signor
  // if (!(payloadObject.owners as string[]).includes(payloadObject.iss)) {
  //   throw new InvalidSignatureError(`Invalid issuer`);
  // }

  const encodedPayload = Base64urlCodec.encode(
    textEncoder.encode(JSON.stringify(sortKeys(payloadObject))),
  );
  const header = { typ: record.header.typ, alg: record.header.alg };
  const encodedHeader = Base64urlCodec.encode(textEncoder.encode(JSON.stringify(header)));
  const encodedSignature = record.signature;
  const jwt = [encodedHeader, encodedPayload, encodedSignature].join('.');

  try {
    await didJwt.verifyJWT(jwt, { resolver: resolvable });
  } catch (e) {
    throw new InvalidSignatureError(e.message);
  }
}
