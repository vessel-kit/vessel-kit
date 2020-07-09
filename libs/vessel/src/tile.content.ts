import * as t from 'io-ts'

const TileContent = t.type({
  doctype: t.string.pipe(t.literal('tile')),
  owners: t.array(t.string)
})
