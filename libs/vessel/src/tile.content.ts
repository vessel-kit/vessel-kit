import * as t from 'io-ts';
import { ThreeIdentifierStringCodec } from './three-identifier';

export const TileContent = t.type({
  doctype: t.string.pipe(t.literal('tile')),
  owners: t.array(t.string.pipe(ThreeIdentifierStringCodec)),
  content: t.UnknownRecord,
});

export const TileContentIpldCodec = t.type({
  doctype: t.string.pipe(t.literal('tile')),
  owners: t.array(t.string.pipe(ThreeIdentifierStringCodec)),
  content: t.UnknownRecord,
});
