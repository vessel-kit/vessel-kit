import axios from 'axios'

async function main() {
  const docId = process.argv[2]
  const endpoint = `http://localhost:3001/api/v0/ceramic/${docId}/state`
  const response = await axios.get(endpoint)
  console.log(response.data)
}

main()
