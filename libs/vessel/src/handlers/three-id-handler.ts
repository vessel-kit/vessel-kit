import { IHandler } from './handler.interface';
import Joi from '@hapi/joi';
import multibase from 'multibase';
import * as multicodec from 'multicodec';
import * as t from 'io-ts';
import * as tPromise from 'io-ts-promise';
import jose from 'jose';
import base64url from 'base64url';
import { multicodecCodec as PublicKeyMulticodec, PublicKey } from '../person/public-key';
import { AnchoringStatus, BufferMultibaseCodec, ThreeIdContent } from '..';
import { DocumentState } from '../document.state';
import { RecordWrap } from '../record-wrap';
import produce from 'immer';
import { ProofRecord } from '../anchoring.service';
import * as _ from 'lodash';
import sortKeys from 'sort-keys';
import { verifyThreeId } from './verify-three-did';

const PublicKeyString = Joi.string().custom(value => {
  const buffer = multibase.decode(value);
  const codecIndex = multicodec.getCode(buffer);
  const point = multicodec.rmPrefix(buffer);
  switch (codecIndex) {
    case 0xe7:
      let x = point.slice(0, point.length / 2);
      let y = point.slice(point.length / 2, point.length);
      return new PublicKey(
        jose.JWK.asKey({
          crv: 'secp256k1' as 'secp256k1',
          x: base64url.encode(x),
          y: base64url.encode(y),
          kty: 'EC' as 'EC',
        }),
      );
    case 0xec:
      return new PublicKey(
        jose.JWK.asKey({
          crv: 'X25519' as 'X25519',
          x: base64url.encode(point),
          kty: 'OKP' as 'OKP',
        }),
      );
    default:
      throw new Error(`Unexpected codec ${codecIndex}`);
  }
});

const GENESIS_SCHEMA = Joi.object({
  doctype: Joi.string().valid('3id'),
  owners: Joi.array()
    .items(PublicKeyString)
    .required(),
  content: Joi.object({
    publicKeys: Joi.object({
      signing: PublicKeyString,
      encryption: PublicKeyString,
    }),
  }),
});

const ThreeIdFreight = t.type({
  owners: t.array(t.string.pipe(BufferMultibaseCodec).pipe(PublicKeyMulticodec)),
  content: t.type({
    publicKeys: t.type({
      encryption: t.string.pipe(BufferMultibaseCodec).pipe(PublicKeyMulticodec),
      signing: t.string.pipe(BufferMultibaseCodec).pipe(PublicKeyMulticodec),
    }),
  }),
});

export class InvalidDocumentUpdateLinkError extends Error {}

export function decodeJWT(jwt: string) {
  if (!jwt) throw new Error('no JWT passed into decodeJWT');
  const parts: RegExpMatchArray = jwt.match(/^([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)$/);
  if (parts) {
    return {
      header: JSON.parse(base64url.decode(parts[1])),
      payload: JSON.parse(base64url.decode(parts[2])),
      signature: parts[3],
      data: `${parts[1]}.${parts[2]}`,
    };
  }
  throw new Error('Incorrect format JWT');
}

export class ThreeIdHandler implements IHandler {
  async makeGenesis(genesis: any): Promise<any> {
    await GENESIS_SCHEMA.validateAsync(genesis);
    return genesis;
  }

  async applyGenesis(genesis: any) {
    return genesis;
  }

  async applyUpdate(record: RecordWrap, state: DocumentState) {
    if (!(record.load.id && record.load.id.equals(state.log.first))) {
      throw new InvalidDocumentUpdateLinkError(`Expected ${state.log.first} id while got ${record.load.id}`);
    }
    const payloadObject = _.omit(record.load, ['header', 'signature']);
    payloadObject.prev = { '/': payloadObject.prev.toString() };
    payloadObject.id = { '/': payloadObject.id.toString() };
    // payloadObject.iss = record.lo
    const encodedPayload = base64url(JSON.stringify(sortKeys(payloadObject, { deep: true })));
    const encodedHeader = base64url(JSON.stringify(record.load.header));
    const encodedSignature = record.load.signature;
    const jwt = [encodedHeader, encodedPayload, encodedSignature].join('.');
    const currentState = state.freight;
    const threeIdContent = await tPromise.decode(ThreeIdContent.codec, currentState);
    await verifyThreeId(jwt, `did:3:${state.log.first.toString()}`, threeIdContent);

    // console.log('three id.applyUpdate', deco)
    // Check Signature
    // Push to log
    // Return next state
  }

  async applyAnchor(anchorRecord: RecordWrap, proof: ProofRecord, state: DocumentState): Promise<DocumentState> {
    return produce(state, async next => {
      next.log = next.log.concat(anchorRecord.cid);
      if (next.current) {
        next.freight = next.current;
      }
      next.anchor = {
        status: AnchoringStatus.ANCHORED,
        proof: {
          chainId: proof.chainId,
          blockNumber: proof.blockNumber,
          timestamp: new Date(proof.blockTimestamp * 1000),
          txHash: proof.txHash,
          root: proof.root,
        },
      };
    });
  }
}