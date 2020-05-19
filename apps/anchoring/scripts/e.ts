import axios from 'axios';

function accountLinkGenesisRecord() {
  return { doctype: 'account-link', owners: [ '0x25954ef14cebbc9af3d71132489a9cfe87043f20@eip155:1' ] };
}

const ENDPOINT = 'http://localhost:3002/api/v0/ceramic';

async function create(record: any) {
  const result = await axios.post(ENDPOINT, record);
  return result.data.docId;
}

async function main() {
  const documentDocId = await create(accountLinkGenesisRecord())
  // bafyreihg3i2wdlxbk3njjhvtwb5ttm2o5bct322b3ativrf5vaom2mapga
  console.log('Document id', documentDocId)
}

main();
