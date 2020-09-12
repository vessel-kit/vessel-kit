import axios from 'axios';
const CID = require('cids');

const FAKE_CID_1 = new CID('bafyreid5hbqpacf3cxm2tb55xn4ex4xs3fbbq75khxi6v2uzk546nk54ra');
const record = { content: [{ op: 'add', path: '/very', value: 'content' }], prev: FAKE_CID_1 };
const documentDocId = 'bafyreid5hbqpacf3cxm2tb55xn4ex4xs3fbbq75khxi6v2uzk546nk54ra';

const ENDPOINT = 'http://localhost:3002/api/v0/document';

async function main() {
  const result = await axios.put(`${ENDPOINT}/${documentDocId}`, record);
  console.log(result.data);
}

main();
