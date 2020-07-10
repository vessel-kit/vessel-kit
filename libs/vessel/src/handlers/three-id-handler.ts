import { IHandler } from './handler.interface';
import Joi from '@hapi/joi';
import multibase from 'multibase';
import * as multicodec from 'multicodec';
import * as t from 'io-ts';
import * as tPromise from 'io-ts-promise';
import jose from 'jose';
import base64url from 'base64url';
import { PublicKey } from '../person/public-key';
import { ThreeIdContent } from '..';
import { DocumentState } from '../document.state';
import { RecordWrap, BufferMultibaseCodec, validatePromise } from '@potter/codec';
import produce from 'immer';
import * as _ from 'lodash';
import sortKeys from 'sort-keys';
import { verifyThreeId } from './verify-three-did';
import jsonPatch from 'fast-json-patch';
import { AnchoringStatus, AnchorProof } from '@potter/anchoring';
import { PublicKeyMulticodecCodec } from '../person/public-key.multicodec.codec';

const PublicKeyString = Joi.string().custom((value) => {
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
  owners: Joi.array().items(PublicKeyString).required(),
  content: Joi.object({
    publicKeys: Joi.object({
      signing: PublicKeyString,
      encryption: PublicKeyString,
    }),
  }),
});

export const ThreeIdFreight = t.type({
  doctype: t.literal('3id'),
  owners: t.array(t.string.pipe(BufferMultibaseCodec).pipe(PublicKeyMulticodecCodec)),
  content: t.type({
    publicKeys: t.type({
      encryption: t.string.pipe(BufferMultibaseCodec).pipe(PublicKeyMulticodecCodec),
      signing: t.string.pipe(BufferMultibaseCodec).pipe(PublicKeyMulticodecCodec),
    }),
  }),
});

export const TreeIdIpldCodec = t.type({
  doctype: t.literal('3id'),
  owners: t.array(t.string.pipe(BufferMultibaseCodec).pipe(PublicKeyMulticodecCodec)),
  content: t.type({
    publicKeys: t.type({
      encryption: t.string.pipe(BufferMultibaseCodec).pipe(PublicKeyMulticodecCodec),
      signing: t.string.pipe(BufferMultibaseCodec).pipe(PublicKeyMulticodecCodec),
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
    await validatePromise(ThreeIdFreight, genesis)
    return genesis
  }

  async applyGenesis(genesis: any) {
    return genesis;
  }

  async applyUpdate(record: RecordWrap, state: DocumentState): Promise<DocumentState> {
    if (!(record.load.id && record.load.id.equals(state.log.first))) {
      throw new InvalidDocumentUpdateLinkError(`Expected ${state.log.first} id while got ${record.load.id}`);
    }
    const payloadObject = _.omit(record.load, ['header', 'signature']);
    payloadObject.prev = { '/': payloadObject.prev.toString() };
    payloadObject.id = { '/': payloadObject.id.toString() };
    const encodedPayload = base64url(JSON.stringify(sortKeys(payloadObject, { deep: true })));
    const encodedHeader = base64url(JSON.stringify(record.load.header));
    const encodedSignature = record.load.signature;
    const jwt = [encodedHeader, encodedPayload, encodedSignature].join('.');
    const freight = state.freight;
    const threeIdContent = await tPromise.decode(ThreeIdContent.codec, freight);
    await verifyThreeId(jwt, `did:3:${state.log.first.toString()}`, threeIdContent);
    const next = jsonPatch.applyPatch(state.current || state.freight, payloadObject.patch, false, false);
    return {
      ...state,
      current: next.newDocument,
      log: state.log.concat(record.cid),
      anchor: {
        status: AnchoringStatus.NOT_REQUESTED,
      },
    };
  }

  async applyAnchor(anchorRecord: RecordWrap, proof: AnchorProof, state: DocumentState): Promise<DocumentState> {
    return produce(state, async (next) => {
      next.log = next.log.concat(anchorRecord.cid);
      if (next.current) {
        next.freight = next.current;
        next.current = null;
      }
      next.anchor = {
        status: AnchoringStatus.ANCHORED,
        proof: {
          chainId: proof.chainId.toString(),
          blockNumber: proof.blockNumber,
          timestamp: new Date(proof.blockTimestamp * 1000),
          txHash: proof.txHash,
          root: proof.root,
        },
      };
    });
  }
}
