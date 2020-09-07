import { DoctypeHandler } from '../../document/doctype';
import jsonPatch from 'fast-json-patch';
import { InvalidDocumentUpdateLinkError } from '../invalid-document-update-link.error';
import { DidPresentation } from './did.presentation';
import { assertSignature } from '../../assert-signature';
import Ajv from 'ajv';
import * as ThreeIdShapeSchema from './three-id-shape.schema.json';
import { ThreeIdShape } from './three-id-shape';
import { AnchoringStatus } from '@vessel-kit/anchoring';
import produce from 'immer';
import { RecordWrap } from '@vessel-kit/codec';
import { Ordering } from '../../document/ordering';
import { ThreeIdState } from './three-id-state';

const validate = new Ajv().compile(ThreeIdShapeSchema);
function isShape(genesis: any): genesis is ThreeIdShape {
  return Boolean(validate(genesis));
}

class ThreeIdHandler extends DoctypeHandler<ThreeIdState, ThreeIdShape> {
  name = '3id';

  async knead(genesis: unknown): Promise<ThreeIdState> {
    if (isShape(genesis)) {
      return {
        current: null,
        freight: genesis,
        anchor: {
          status: AnchoringStatus.NOT_REQUESTED,
        },
      };
    } else {
      throw new Error('Invalid ThreeIdShape');
    }
  }

  async order(a: ThreeIdState, b: ThreeIdState): Promise<Ordering> {
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

  async canonical(state: ThreeIdState): Promise<ThreeIdShape> {
    return state.current || state.freight;
  }

  async apply(recordWrap: RecordWrap, state: ThreeIdState, docId): Promise<ThreeIdState> {
    const record = recordWrap.load
    if (record.prev) {
      if (record.proof) {
        const proof = await this.context.verifyAnchor(recordWrap)
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
      } else {
        if (!(recordWrap.load.id && recordWrap.load.id.equals(docId.cid))) {
          throw new InvalidDocumentUpdateLinkError(`Expected ${docId.cid} id while got ${recordWrap.load.id}`);
        }
        const didPresentation = new DidPresentation(`did:3:${docId.cid.toString()}`, state.freight, true);
        const resolver = {
          resolve: async () => didPresentation,
        };
        await assertSignature(recordWrap.load, resolver);
        const next = jsonPatch.applyPatch(state.current || state.freight, recordWrap.load.patch, false, false)
          .newDocument;
        return {
          ...state,
          current: next,
        };
      }
    } else {
      throw new Error(`Can not apply genesis`)
    }
  }
}

export const ThreeIdDoctype = new ThreeIdHandler();
