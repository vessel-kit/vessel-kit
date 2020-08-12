import * as t from 'io-ts';
import { ThreeIdentifier } from '../../three-identifier';
import { DoctypeHandler } from '../../document/doctype';
import { TileShapeBase, TileShape } from './tile-shape';
import { AnchorState } from '../../document/document.state';
import Ajv from 'ajv';
import * as TileShapeSchema from './tile-shape.schema.json';
import { AnchoringStatus } from '@potter/anchoring';
import produce from 'immer';
import { RecordWrap } from '@potter/codec';
import { AnchorProof } from '@potter/anchoring';
import { InvalidDocumentUpdateLinkError } from '../invalid-document-update-link.error';
import jsonPatch from 'fast-json-patch';
import { Ordering } from '../../document/ordering';
import * as _ from 'lodash';

export type TileState = {
  current: TileShapeBase | null;
  freight: TileShape;
  anchor: AnchorState;
};

const validate = new Ajv().compile(TileShapeSchema);
function isShape(genesis: any): genesis is TileShapeBase {
  return Boolean(validate(genesis));
}

const json = t.type({
  doctype: t.literal('tile'),
  owners: t.array(ThreeIdentifier),
  content: t.UnknownRecord,
  iss: ThreeIdentifier,
  header: t.type({
    typ: t.literal('JWT'),
    alg: t.string,
  }),
  signature: t.string,
});

export class TileHandler extends DoctypeHandler<TileState, TileShapeBase> {
  readonly name = 'tile';

  async genesisFromFreight(payload) {
    const applied = Object.assign({}, payload, { doctype: this.name });
    const encoded = json.encode(applied);
    return this.context.sign(encoded);
  }

  async knead(genesisRecord: unknown): Promise<TileState> {
    if (isShape(genesisRecord)) {
      await this.context.assertSignature(genesisRecord);
      return {
        current: null,
        freight: genesisRecord,
        anchor: {
          status: AnchoringStatus.NOT_REQUESTED,
        },
      };
    } else {
      console.error(`Not proper Tile shape`, genesisRecord);
      throw new Error(`Invalid shape: expected Tile`);
    }
  }

  async order(a: TileState, b: TileState): Promise<Ordering> {
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

  async applyAnchor(anchorRecord: RecordWrap, proof: AnchorProof, state: TileState): Promise<TileState> {
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

  async applyUpdate(updateRecord, state: TileState, docId): Promise<TileState> {
    if (!(updateRecord.load.id && updateRecord.load.id.equals(docId.cid))) {
      throw new InvalidDocumentUpdateLinkError(`Expected ${docId.cid} id while got ${updateRecord.load.id}`);
    }
    await this.context.assertSignature(updateRecord.load);
    const next = jsonPatch.applyPatch(state.current || state.freight, updateRecord.load.patch, false, false)
      .newDocument;
    state.current = next;
    state.anchor = {
      status: AnchoringStatus.NOT_REQUESTED,
    };
    return state;
  }

  async canonical(state: TileState): Promise<TileShapeBase> {
    return state.current || state.freight;
  }

  async apply(recordWrap, state: TileState, docId): Promise<TileState> {
    const record = recordWrap.load;
    if (record.prev) {
      if (record.proof) {
        const proof = await this.context.verifyAnchor(recordWrap);
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
        await this.context.assertSignature(record);
        const next = jsonPatch.applyPatch(state.current || state.freight, record.patch, false, false).newDocument;
        return {
          ...state,
          current: next,
        };
      }
    } else {
      throw new Error(`Can not apply genesis`);
    }
  }
}

export const TileDoctype = new TileHandler();
