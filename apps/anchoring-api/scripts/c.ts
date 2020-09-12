import axios from 'axios';

function tileGenesisRecord() {
  return { doctype: 'tile', owners: ['did:3:bafyasdfasdf'], content: { much: 'data' } };
}

const ENDPOINT = 'http://localhost:3002/api/v0/document';

async function create(record: any) {
  const result = await axios.post(ENDPOINT, record);
  return result.data.docId;
}

async function main() {
  const documentDocId = await create(tileGenesisRecord());
  // bafyreihgjdgdrdaezncix7pgixmzzu3q3nf6efmubrsumgnosgol2oa2hm
  console.log('Document id', documentDocId);
}

main();
