import { PublicKey, ThreeIdContent } from '@potter/vessel';
import * as jose from 'jose';
import axios from 'axios';
import { document, ENDPOINT, KEY_C } from './shared';

const doc1 = document
const doc2 = doc1.clone();

const foocryptionKey = new PublicKey(jose.JWK.asKey(KEY_C));
doc2.publicKeys.set('foocryption', foocryptionKey);

async function main() {
  const doc1Cid = 'bafyreigdo4edyvd4ujdw2zzxu23gvnazwc3zvvlouutsnj2w27vorovk4q'
  const delta = doc2.delta(doc1)
  const record = Object.assign({
    prev: doc1Cid,
    patch: delta
  })
  const response = await axios.put(`${ENDPOINT}/${doc1Cid}`, record)
  console.log(response.data)
}

main()
