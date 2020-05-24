import CID from 'cids';
import { CeramicDocumentId } from './ceramic-document-id';

const cid = new CID('QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D');

test('constructor', () => {
  const id = new CeramicDocumentId(cid);
  expect(id.toString()).toEqual(`ceramic://${cid.toString()}`);
});

test('.build from /ceramic', () => {
  const id = CeramicDocumentId.fromString("/ceramic/QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D")
  expect(id.toString()).toEqual(`ceramic://${cid.toString()}`);
})

test('.build from ceramic://', () => {
  const id = CeramicDocumentId.fromString("ceramic://QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D")
  expect(id.toString()).toEqual(`ceramic://${cid.toString()}`);
})
