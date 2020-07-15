import * as t from 'io-ts';
import { ThreeIdentifier } from './three-identifier';

export const TileContent = t.type({
  doctype: t.string.pipe(t.literal('tile')),
  owners: t.array(t.string.pipe(ThreeIdentifier)),
  content: t.UnknownRecord,
});