import axios from 'axios';
const CID = require('cids')

const FAKE_CID_1 = new CID('bafyreihgjdgdrdaezncix7pgixmzzu3q3nf6efmubrsumgnosgol2oa2hm')
const record = { content: [ { op: 'add', path: '/very', value: 'content' } ], prev: FAKE_CID_1 };
const documentDocId = 'bafyreihgjdgdrdaezncix7pgixmzzu3q3nf6efmubrsumgnosgol2oa2hm'

const ENDPOINT = 'http://localhost:3002/api/v0/document';

async function main() {
  const result = await axios.put(`${ENDPOINT}/${documentDocId}`, record)
  console.log(result.data)
}

main();

