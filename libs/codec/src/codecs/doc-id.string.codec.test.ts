import CID from 'cids';
import { DocId } from '../doc-id';
import { DocIdStringCodec } from './doc-id.string.codec';
import { decodeThrow } from '../decode-throw';

const cid = new CID('QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D');

test('constructor', () => {
  const id = new DocId(cid);
  expect(DocIdStringCodec.encode(id)).toEqual(`vessel://${cid.toString()}`);
});

test('.build from /vessel', async () => {
  const id = decodeThrow(DocIdStringCodec, `/vessel/${cid.toString()}`);
  expect(id.cid).toEqual(cid);
});

test('.build from vessel://', async () => {
  const id = decodeThrow(DocIdStringCodec, `vessel://${cid.toString()}`);
  expect(id.cid).toEqual(cid);
});
