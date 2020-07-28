import * as jose from 'jose';
import * as t from 'io-ts';
import { JWKMulticodecCodec } from '../../signor/jwk.multicodec.codec';
import { BufferMultibaseCodec, SimpleCodec } from '@potter/codec';
import { DoctypeHandler, Ordering } from '../../document/doctype';
import { AnchorState } from '../../document/document.state';
import jsonPatch from 'fast-json-patch';
import { InvalidDocumentUpdateLinkError } from '../invalid-document-update-link.error';
import { UpdateRecordWaiting } from '../../util/update-record.codec';
import { DidPresentation } from './did.presentation';
import { assertSignature } from '../../assert-signature';
import Ajv from 'ajv';
import * as ThreeIdShapeSchema from './three-id-shape.schema.json';
import { ThreeIdShape } from './three-id-shape';
import { AnchoringStatus } from '@potter/anchoring';
import produce from 'immer';
import { RecordWrap, CeramicDocumentId } from '@potter/codec';
import { AnchorProof } from '@potter/anchoring';

const DOCTYPE = '3id';

// export interface ThreeIdFreight {
//   doctype: typeof DOCTYPE;
//   owners: jose.JWK.Key[];
//   content: {
//     publicKeys: {
//       signing: jose.JWK.Key;
//       encryption: jose.JWK.Key;
//     };
//   };
// }

// const json = new SimpleCodec<ThreeIdFreight>(
//   t.type({
//     doctype: t.literal(DOCTYPE),
//     owners: t.array(t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec)),
//     content: t.type({
//       publicKeys: t.type({
//         encryption: t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec),
//         signing: t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec),
//       }),
//     }),
//   }),
// );

type State = {
  current: ThreeIdShape | null;
  freight: ThreeIdShape;
  anchor: AnchorState;
};

const validate = new Ajv().compile(ThreeIdShapeSchema);
function isShape(genesis: any): genesis is ThreeIdShape {
  return Boolean(validate(genesis));
}

class ThreeIdHandler extends DoctypeHandler<State, ThreeIdShape> {
  name = DOCTYPE;

  validate = new Ajv().compile(ThreeIdShapeSchema);

  async knead(genesis: unknown): Promise<State> {
    if (isShape(genesis)) {
      return {
        current: null,
        freight: genesis,
        anchor: {
          status: AnchoringStatus.NOT_REQUESTED,
        },
      };
    } else {
      throw new Error('Invalid');
    }
  }

  async order(a: State, b: State): Promise<Ordering> {
    if (
      a.anchor.status === AnchoringStatus.ANCHORED &&
      b.anchor.status === AnchoringStatus.ANCHORED &&
      a.anchor.proof.timestamp < b.anchor.proof.timestamp
    ) {
      return Ordering.LT;
    } else {
      return Ordering.GT;
    }
  }

  // async update(document, next) {
  //   const nextJSON = json.encode(next);
  //   const currentJSON = document.current;
  //   const patch = jsonPatch.compare(nextJSON, currentJSON);
  //   const payloadToSign = UpdateRecordWaiting.encode({
  //     patch: patch,
  //     prev: document.log.last,
  //     id: document.id,
  //   });
  //   return this.context.sign(payloadToSign, { useMgmt: true });
  // }

  async applyUpdate(updateRecord: RecordWrap, state: State, docId: CeramicDocumentId): Promise<State> {
    if (!(updateRecord.load.id && updateRecord.load.id.equals(docId.cid))) {
      throw new InvalidDocumentUpdateLinkError(`Expected ${docId.cid} id while got ${updateRecord.load.id}`);
    }
    const didPresentation = new DidPresentation(`did:3:${docId.cid.toString()}`, state.freight, true);
    const resolver = {
      resolve: async () => didPresentation,
    };
    await assertSignature(updateRecord.load, resolver);
    const next = jsonPatch.applyPatch(state.current || state.freight, updateRecord.load.patch, false, false)
      .newDocument;
    return {
      ...state,
      current: next,
    };
  }

  async applyAnchor(anchorRecord: RecordWrap, proof: AnchorProof, state: State): Promise<State> {
    return produce(state, async (next) => {
      if (next.current) {
        next.freight = next.current;
        next.current = null;
      }
      next.anchor = {
        status: AnchoringStatus.ANCHORED as AnchoringStatus.ANCHORED,
        proof: {
          chainId: proof.chainId.toString(),
          blockNumber: proof.blockNumber,
          timestamp: new Date(proof.blockTimestamp * 1000).toISOString(),
          txHash: proof.txHash.toString(),
          root: proof.root.toString(),
        },
      };
    });
  }

  async canonical(state: State): Promise<ThreeIdShape> {
    return state.current || state.freight;
  }
}

export const ThreeId = new ThreeIdHandler();
