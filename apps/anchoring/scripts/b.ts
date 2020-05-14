import axios from 'axios';

const documentDocId = 'bafyreiera356dhw7lmmj22ako54vg4i2d7p6y4g4bv73yvdeomyaifq2ru'

const ENDPOINT = 'http://localhost:3002/api/v0/ceramic';

async function main() {
  const result = await axios.put(`${ENDPOINT}/${documentDocId}`, {
    prev: {'/': documentDocId},
    content: {
      num: 3
    }
  })
  console.log(result.data)
}

main();

