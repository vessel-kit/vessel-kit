import { DIDDocument } from 'did-resolver';
import base64url from 'base64url';
import { InvalidSignatureError } from './invalid-signature.error';
import _ from 'lodash';
import { sortKeys } from './util/sort-keys';
import * as didJwt from 'did-jwt';

export interface Resolvable {
  resolve: (did: string) => Promise<DIDDocument | null>;
}

export async function assertSignature(record: any, resolvable: Resolvable): Promise<void> {
  const payloadObject = _.omit(record, ['header', 'signature']);
  payloadObject.prev = payloadObject.prev ? { '/': payloadObject.prev.toString() } : undefined;
  payloadObject.id = payloadObject.id ? { '/': payloadObject.id.toString() } : undefined;

  const encodedPayload = base64url(JSON.stringify(sortKeys(payloadObject)));
  const header = { typ: record.header.typ, alg: record.header.alg };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedSignature = record.signature;
  const jwt = [encodedHeader, encodedPayload, encodedSignature].join('.');

  try {
    await didJwt.verifyJWT(jwt, { resolver: resolvable });
  } catch (e) {
    throw new InvalidSignatureError(e.message);
  }
}
