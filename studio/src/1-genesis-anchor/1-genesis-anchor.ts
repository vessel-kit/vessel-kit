import axios from 'axios'

const WHEEL_ENDPOINT = 'http://localhost:3001/api/v0/ceramic'

const DOCUMENT = {
  doctype: 'vessel/0.0.1',
  content: {
    foo: 2
  }
}

async function main() {
  const result = await axios.post(WHEEL_ENDPOINT, DOCUMENT)
  console.log(result.data)
}

main()
