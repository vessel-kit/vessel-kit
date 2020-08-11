import { DIDDocument } from 'did-resolver';
import base64url from 'base64url';
import { InvalidSignatureError } from './invalid-signature.error';
import _ from 'lodash';
import { sortKeys } from './util/sort-keys';
import * as didJwt from 'did-jwt';

export interface Resolvable {
  resolve: (did: string) => Promise<DIDDocument | null>;
}

const strinfy = function(obj) {
  return JSON.stringify(obj,function(key, value){
    return (typeof value === 'function' ) ? value.toString() : value;
  });
}

export async function assertSignature(record: any, resolvable: Resolvable): Promise<void> {
  console.log('+++ RECORD ASSERTION: ')
  console.log(JSON.stringify(record))
  const payloadObject = _.omit(record, ['header', 'signature']);
  payloadObject.prev = payloadObject.prev ? { '/': payloadObject.prev.toString() } : undefined;
  payloadObject.id = payloadObject.id ? { '/': payloadObject.id.toString() } : undefined;

  const encodedPayload = base64url(JSON.stringify(sortKeys(payloadObject)));
  const header = { typ: record.header.typ, alg: record.header.alg };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedSignature = record.signature;
  const jwt = [encodedHeader, encodedPayload, encodedSignature].join('.');
  console.log('== Verifying signature... JWT is ' + JSON.stringify(jwt) )
  try {
    await didJwt.verifyJWT(jwt, { resolver: resolvable });
  } catch (e) {
    throw new InvalidSignatureError(e.message);
  }
}

export async function assertSignature2(record: any, resolvable: Resolvable): Promise<void> {
  console.log('resolve::: ' + JSON.stringify(await resolvable.resolve('did:3:bafyreic3pjr64v764qezetbqbyd66djmbhzlbkqr7e3cpceomagkghed2a')))
  console.log('+++ RECORD ASSERTION: ')
  console.log(JSON.stringify(record))
  const payloadObject = _.omit(record.content, ['']);
  console.log('+++ payloadObject ASSERTION: ')
  console.log(JSON.stringify(payloadObject))
  payloadObject.prev = payloadObject.prev ? { '/': payloadObject.prev.toString() } : undefined;
  payloadObject.id = payloadObject.id ? { '/': payloadObject.id.toString() } : undefined;

  //
  // const payload = {
  //   ruleset: record.ruleset,
  //   content: {
  //     payload: {
  //       ...payloadObject.payload
  //     }
  //   },
  //   iss: 'did:3:bafyreic3pjr64v764qezetbqbyd66djmbhzlbkqr7e3cpceomagkghed2a'
  // }
  const payload = {
    iss: 'did:3:bafyreibedfxqj6e2lhj6fmrxpxvkn3qogzh65247udaz7vq5jb3os4cnxe'
  }

  console.log('^^^ Payload: '+JSON.stringify(sortKeys(payload)))

  const encodedPayload = base64url(JSON.stringify(sortKeys(payload)));
  const encodedHeader = base64url(JSON.stringify(record.content.party.header));
  const encodedSignature = record.content.party.signature;
  console.log('encodedHeader = ' + encodedHeader)
  console.log('encodedSignature = ' + encodedSignature)
  const jwt = [encodedHeader, encodedPayload, encodedSignature].join('.');
  console.log('== Verifying signature... JWT is ' + JSON.stringify(jwt) )
  console.log('resolvable = ' + strinfy(resolvable))

  let decoded = didJwt.decodeJWT(jwt)
  console.log('DECODED::: ' + JSON.stringify(decoded))

  // console.log('### Sign again: ' + JSON.stringify(await user.))

  try {
    console.log('START to verify_____')
    await didJwt.verifyJWT(jwt, { resolver: resolvable });
    console.log('------END to verify_____')
  } catch (e) {
    console.log('------THROW to verify_____')
    throw new InvalidSignatureError(e.message);
  }
}
