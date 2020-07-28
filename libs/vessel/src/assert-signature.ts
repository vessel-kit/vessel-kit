import { DIDDocument, PublicKey } from 'did-resolver';
import base64url from 'base64url';
import { InvalidSignatureError } from './invalid-signature.error';
import _ from 'lodash';
import { sortKeys } from './util/sort-keys';
import * as didJwt from 'did-jwt';

export interface Resolvable {
  resolve: (did: string) => Promise<DIDDocument | null>;
}

export async function assertSignature(record: any, resolvable: Resolvable): Promise<void> {
  console.log('assertSignature', record)
  const payloadObject = _.omit(record, ['header', 'signature']);
  payloadObject.prev = payloadObject.prev ? { '/': payloadObject.prev.toString() } : undefined;
  payloadObject.id = payloadObject.id ? { '/': payloadObject.id.toString() } : undefined;

  // TODO Check signor
  // if (!(payloadObject.owners as string[]).includes(payloadObject.iss)) {
  //   throw new InvalidSignatureError(`Invalid issuer`);
  // }

  const encodedPayload = base64url(JSON.stringify(sortKeys(payloadObject)));
  const header = { typ: record.header.typ, alg: record.header.alg };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedSignature = record.signature;
  const jwt = [encodedHeader, encodedPayload, encodedSignature].join('.');

  console.log('assertSignature.jwt', jwt)
  try {
    await didJwt.verifyJWT(jwt, { resolver: resolvable });
  } catch (e) {
    throw new InvalidSignatureError(e.message);
  }
}
