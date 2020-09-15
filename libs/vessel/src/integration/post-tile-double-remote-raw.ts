import { ThreeIdContent } from '../three-id.content';
import IdentityWallet from 'identity-wallet';
import { User } from '../signor/user';
import { sleep } from './sleep.util';
import axios from 'axios';
import { ThreeIdentifier } from '../three-identifier';
import jsonPatch from 'fast-json-patch';
import { decodeThrow } from '@vessel-kit/codec';
import { SnapshotCodec } from '..';
import * as t from 'io-ts';

const REMOTE_URL = 'http://localhost:3001';

async function createUser(seed: string) {
  const identityWallet = new IdentityWallet(async () => true, {
    seed: seed,
  });
  const user = await User.build(identityWallet.get3idProvider());

  const publicKeys = await user.publicKeys();
  const ownerKey = publicKeys.managementKey;
  const signingKey = publicKeys.signingKey;
  const encryptionKey = publicKeys.asymEncryptionKey;

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
  const genesisResponse = await axios.post(`${REMOTE_URL}/api/v0/document`, genesisRecord);
  const snapshot = decodeThrow(SnapshotCodec(t.unknown), genesisResponse.data)
  await user.did(decodeThrow(ThreeIdentifier, `did:3:${snapshot.log.first}`));
  return user;
}

async function main() {
  const userA = await createUser('0x1110000000000000000000000000000000000000000000000000000000000000');
  const userB = await createUser('0x2220000000000000000000000000000000000000000000000000000000000000');
  const tile = {
    doctype: 'tile' as 'tile',
    owners: [await userA.did(), await userB.did()],
    content: {},
  };
  const jwt = await userA.sign(tile);
  const signedTile = {
    ...tile,
    iss: await userA.did(),
    header: jwt.header,
    signature: jwt.signature,
  };
  const genesisResponse = await axios.post(`${REMOTE_URL}/api/v0/document`, signedTile);
  const snapshot = decodeThrow(SnapshotCodec(t.unknown), genesisResponse.data)
  console.log('genesis response', genesisResponse.data);
  const documentId = snapshot.log.first
  await sleep(65000);
  const anchoredGenesisResponse = await axios.get(`${REMOTE_URL}/api/v0/document/${documentId.toString()}`);
  const anchoredSnapshot = decodeThrow(SnapshotCodec(t.unknown), anchoredGenesisResponse.data)
  const log = anchoredSnapshot.log
  const doc2 = Object.assign({}, tile);
  doc2.content = {
    foo: '33',
  };
  const delta = jsonPatch.compare(tile, doc2);
  console.log(delta);
  const updateRecordToSign = {
    patch: delta,
    prev: { '/': log.last.toString() },
    id: { '/': documentId.valueOf().toString() },
  }
  console.log('signing payload', updateRecordToSign);
  const jwtUpdate = await userB.sign(updateRecordToSign);
  const updateRecordA = {
    ...updateRecordToSign,
    iss: await userB.did(),
    header: jwtUpdate.header,
    signature: jwtUpdate.signature,
  };
  const updateResponse = await axios.put(`${REMOTE_URL}/api/v0/document/${documentId.toString()}`, updateRecordA);
  console.log('update response', updateResponse.data);
}

main();
