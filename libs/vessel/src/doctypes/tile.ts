import { SimpleCodec } from '@potter/codec';
import * as t from 'io-ts';
import { ThreeIdentifier } from '../three-identifier';
import { DoctypeHandler } from '../document/doctype';

interface TileFreight {
  doctype: 'tile';
  owners: ThreeIdentifier[];
  content: any;
}

export class TileHandler extends DoctypeHandler<TileFreight> {
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
  async makeGenesis(payload: any): Promise<any> {
    this.json.assertValid(payload);
    await this.context.assertSignature(payload);
    return payload;
  }
}

export const Tile = new TileHandler();
