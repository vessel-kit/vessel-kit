import { SimpleCodec } from '@potter/codec';
import * as t from 'io-ts';
import { ThreeIdentifier } from '../../three-identifier';
import { DoctypeHandler } from '../../document/doctype';
import { TileShapeBase, TileShape } from './tile-shape';
import { AnchorState } from '../../document/document.state';
import Ajv from 'ajv';
import * as TileShapeSchema from './tile-shape.schema.json';
import { AnchoringStatus } from '@potter/anchoring';

interface TileFreight {
  doctype: 'tile';
  owners: ThreeIdentifier[];
  content: any;
}

class State {
  current: TileShapeBase | null;
  freight: TileShape;
  anchor: AnchorState;

  cone() {
    return this.current || this.freight;
  }
}

const validate = new Ajv().compile(TileShapeSchema);
function isShape(genesis: any): genesis is TileShapeBase {
  return Boolean(validate(genesis));
}

export class TileHandler extends DoctypeHandler<TileFreight, State, TileShapeBase> {
  readonly name = 'tile';
  readonly json = new SimpleCodec(
    t.type({
      doctype: t.literal('tile'),
      owners: t.array(ThreeIdentifier),
      content: t.UnknownRecord,
      iss: ThreeIdentifier,
      header: t.type({
        typ: t.literal('JWT'),
        alg: t.string,
      }),
      signature: t.string,
    }),
  );

  async genesisFromFreight(payload) {
    const applied = Object.assign({}, payload, { doctype: this.name });
    const encoded = this.json.encode(applied);
    return this.context.sign(encoded);
  }

  async knead(genesisRecord: unknown): Promise<State> {
    if (isShape(genesisRecord)) {
      await this.context.assertSignature(genesisRecord);
      const state = new State();
      state.current = null;
      state.freight = genesisRecord;
      state.anchor = {
        status: AnchoringStatus.NOT_REQUESTED,
      };
      return state;
    } else {
      throw new Error(`Invalid`);
    }
  }
}

export const Tile = new TileHandler();
