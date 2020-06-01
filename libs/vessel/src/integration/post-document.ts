import { Ceramic } from '../ceramic';
import ipfsClient from 'ipfs-http-client';
import { PublicKey } from '../person/public-key';
import jose from 'jose';
import { ThreeIdContent } from '../three-id.content';
import { waitUntil } from './wait.util';
import { AnchoringStatus } from '..';

const IPFS_URL = 'http://localhost:5001';
const ipfs = ipfsClient(IPFS_URL);

const KEY_A = {
  crv: 'secp256k1' as 'secp256k1',
  x: 'mTsVRRVOHgyd4HQoOdc7FP7DHGgCxjqXz-52AWBp2l8',
  y: 'q0sojdvefySPiNqhnt-BsdbrvlcLkv3t6luCDCPKuf0',
  d: 'IkcNFsFupww76DVIT3CG20phcNzUF9ZUYjJfXCi84qc',
  kty: 'EC' as 'EC',
  kid: 'tQWqroxi9P40-26AdkhanWwwo_U6j9Ydl5khOXn-jsA',
};

const KEY_B = {
  crv: 'secp256k1' as 'secp256k1',
  x: 'YrtcWMcwwbLP3eMowIU4bgBiZacClCIlfE3Mm6YU7CY',
  y: 'UFo9LeyQF9HQbKRs43f19x98d7TOcEMB8pd_jNZw-lA',
  d: 'EDqkfubdxeGrchJHAF4jR3KE9bV3ILXJc7JgLN4Y1Cg',
  kty: 'EC' as 'EC',
  kid: 'KE9ld4dYiSMNg3Hy5uNJt__Urt6rb2V4mK92p4_f42M',
};

const KEY_C = {
  crv: 'X25519' as 'X25519',
  x: '_Lh9XArich4ckRMStOa1y6dV24KNUJQILi4eIuSn3CY',
  d: '-Os3rBT2H4RVsu7vFnmlX1DzvZ0pKI9gP6UhgIhSZFI',
  kty: 'OKP' as 'OKP',
  kid: 'h3ITqvUm464H-W74fY9HaNPVh4MpxgrIuZre6TG9hwY',
};

async function main() {
  const ceramic = await Ceramic.build(ipfs);
  const ownerKey = new PublicKey(jose.JWK.asKey(KEY_A));
  const signingKey = new PublicKey(jose.JWK.asKey(KEY_B));
  const encryptionKey = new PublicKey(jose.JWK.asKey(KEY_C));
  const doc1 = new ThreeIdContent(
    [ownerKey],
    new Map([
      ['signing', signingKey],
      ['encryption', encryptionKey],
    ]),
  );
  const content = ThreeIdContent.codec.encode(doc1);
  const genesisRecord = {
    doctype: '3id',
    ...content,
  };
  const document = await ceramic.create(genesisRecord);
  console.log('Present state', document.state);
  console.log('Waiting some time for anchoring...');
  const firstSubscription = document.state$.subscribe(state => {
    console.log(`Updated state`, state);
  });
  await waitUntil(5000, async () => {
    return document.state.anchor.status === AnchoringStatus.ANCHORED;
  });
  firstSubscription.unsubscribe();
  console.log(`Present state`, document.state);
  const doc2 = doc1.clone();
  doc2.publicKeys.set('foocryption', signingKey);
  const delta = doc2.delta(doc1);
  console.log('delta', delta);
  const updateRecord = {
    content: delta,
    prev: document.state.log.last
  }
  console.log(updateRecord)
}

main();
