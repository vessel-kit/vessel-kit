import * as t from 'io-ts';
import { History, HistoryCodec } from './util/history';
import { PDoctype } from './pdoctype';
import { IContext } from './context';
import { JWKMulticodecCodec } from './signor/jwk.multicodec.codec';
import { BufferMultibaseCodec } from '@potter/codec';
import { AnchorState } from './document/document.state';
import { decodeThrow } from '@potter/codec';
import { AnchoringStatus } from '@potter/anchoring';

const DOCTYPE = '3id' as '3id';

const Freight = t.type({
  doctype: t.literal(DOCTYPE),
  owners: t.array(t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec)),
  content: t.type({
    publicKeys: t.type({
      encryption: t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec),
      signing: t.string.pipe(BufferMultibaseCodec).pipe(JWKMulticodecCodec),
    }),
  }),
});

const State = t.type({
  doctype: t.literal(DOCTYPE),
  current: t.union([Freight, t.null]),
  freight: Freight,
  anchor: AnchorState,
  log: HistoryCodec,
});

export class PThreeId implements PDoctype<t.TypeOf<typeof State>> {
  readonly name = DOCTYPE;

  constructor(readonly context: IContext) {}

  async create(genesisRecord: unknown) {
    const freight = decodeThrow(Freight, genesisRecord);
    const cid = await this.context.store(genesisRecord);
    return {
      doctype: DOCTYPE,
      current: null,
      freight: freight,
      anchor: {
        status: AnchoringStatus.NOT_REQUESTED as AnchoringStatus.NOT_REQUESTED,
      },
      log: new History([cid]),
    };
  }
}
