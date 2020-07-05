import CID from 'cids';
import { DocId } from './doc-id';

const cidString = 'bafyreihz4grumy4fp3zpa6xazu32wd7evlrkpdaeyc2xwqoedhgcrbtusy';
const cid = new CID(cidString);

test('#toString', () => {
  const docId = new DocId(cid);
  expect(docId.toString()).toEqual(`/ceramic/${cidString}`);
});

test('#asURI', () => {
  const docId = new DocId(cid);
  expect(docId.asURI().toString()).toEqual(`ceramic://${cidString}`);
});

describe('.build', () => {
  test('from CID string', () => {
    const docId = DocId.build(cidString);
    expect(docId.toString()).toEqual(`/ceramic/${cidString}`);
  });

  test('from CID', () => {
    const docId = DocId.build(cid);
    expect(docId.toString()).toEqual(`/ceramic/${cidString}`);
  });

  test('from slash-path', () => {
    const docId = DocId.build(`/ceramic/${cidString}`);
    expect(docId.toString()).toEqual(`/ceramic/${cidString}`);
  });

  test('from URL string', () => {
    const docId = DocId.build(`ceramic://${cidString}`);
    expect(docId.toString()).toEqual(`/ceramic/${cidString}`);
  });

  test('from URL', () => {
    const url = new URL(`ceramic://${cidString}`);
    const docId = DocId.build(url);
    expect(docId.toString()).toEqual(`/ceramic/${cidString}`);
  });
});
