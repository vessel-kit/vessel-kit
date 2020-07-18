import { IHandler } from './handler.interface';
import * as t from 'io-ts';
import base64url from 'base64url';
import { ThreeIdContent } from '..';
import { DocumentState } from '../document/document.state';
import { RecordWrap, BufferMultibaseCodec, validatePromise } from '@potter/codec';
import produce from 'immer';
import * as _ from 'lodash';
import sortKeys from 'sort-keys';
import jsonPatch from 'fast-json-patch';
import { AnchoringStatus, AnchorProof } from '@potter/anchoring';
import { JWKMulticodecCodec } from '../signor/jwk.multicodec.codec';
import { decodePromise } from '@potter/codec';
import { decodeJWT, verifyJWT } from 'did-jwt';
import { DIDDocument } from 'did-resolver';
import { DidPresentation } from '../did.presentation';
import { InvalidSignatureError } from '../invalid-signature.error';

export const ThreeIdFreight = t.type({
  doctype: t.literal('3id'),
  owners: t.array(t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec)),
  content: t.type({
    publicKeys: t.type({
      encryption: t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec),
      signing: t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec),
    }),
  }),
});

export class InvalidDocumentUpdateLinkError extends Error {}

function withNormalizedHeader(jwt: string) {
  const { header } = decodeJWT(jwt);
  const correctHeader = { typ: header.typ, alg: header.alg };
  const encodedCorrectHeader = base64url(JSON.stringify(correctHeader));
  const parts = jwt.split('.');
  return [encodedCorrectHeader, parts[1], parts[2]].join('.');
}

export function wrapThreeId(id: string, content: ThreeIdContent): DIDDocument {
  const presentation = new DidPresentation(id, content)
  return presentation.toJSON()
}

export async function verifyThreeId(jwt: string, id: string, content: ThreeIdContent): Promise<void> {
  const didPresentation = wrapThreeId(id, content);
  const normalized = withNormalizedHeader(jwt);
  try {
    await verifyJWT(normalized, {
      resolver: {
        resolve: async () => didPresentation,
      },
    });
  } catch (e) {
    console.error(e);
    throw new InvalidSignatureError(`Invalid signature for ${id}`);
  }
}

export class ThreeIdHandler implements IHandler {
  async makeGenesis(genesis: any): Promise<any> {
    await validatePromise(ThreeIdFreight, genesis);
    return genesis;
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
    const threeIdContent = await decodePromise(ThreeIdContent.codec, freight);
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
