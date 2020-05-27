import { PublicKey, ThreeIdContent } from '@potter/vessel';
import * as jose from 'jose';
import axios from 'axios'
import { ENDPOINT, document } from './shared';

async function main() {
  const payload = ThreeIdContent.codec.encode(document)
  const record = Object.assign({doctype: "3id"}, payload)
  console.log('Posting document')
  const request = await axios.post(ENDPOINT, record)
  const response = request.data
  const docId = response.docId
  console.log(`Created document ${docId}`)
  const stateEndpoint = `${ENDPOINT}/${docId}/state`
  console.log(`Getting state at ${stateEndpoint}`)
  const stateRequest = await axios.get(stateEndpoint)
  console.log(stateRequest.data)
}

main()
