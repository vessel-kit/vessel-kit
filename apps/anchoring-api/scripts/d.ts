import axios from 'axios';

function threeIdGenesisRecord() {
  return { doctype: '3id', owners: ['0x123'], content: { publicKeys: { test: '0xabc' } } };
}

const ENDPOINT = 'http://localhost:3002/api/v0/document';

async function create(record: any) {
  const result = await axios.post(ENDPOINT, record);
  return result.data.docId;
}

async function main() {
  const documentDocId = await create(threeIdGenesisRecord());
  // bafyreid5hbqpacf3cxm2tb55xn4ex4xs3fbbq75khxi6v2uzk546nk54ra
  console.log('Document id', documentDocId);
}

main();
