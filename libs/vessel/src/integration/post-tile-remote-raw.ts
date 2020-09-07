import { ThreeIdContent } from '../three-id.content';
import IdentityWallet from 'identity-wallet';
import { User } from '../signor/user';
import { sleep } from './sleep.util';
import axios from 'axios';
import CID from 'cids';
import { History } from '../util/history';
import { ThreeIdentifier } from '../three-identifier';
import jsonPatch from 'fast-json-patch';
import { decodeThrow } from '@vessel-kit/codec';
import { sortKeys } from '../util/sort-keys';
import { SnapshotCodec } from '..';
import * as t from 'io-ts';

const REMOTE_URL = 'http://localhost:3001';

async function createUser(seed: string) {
  const identityWallet = new IdentityWallet(() => true, {
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
  const genesisResponse = await axios.post(`${REMOTE_URL}/api/v0/ceramic`, genesisRecord);
  const snapshot = decodeThrow(SnapshotCodec(t.unknown), genesisResponse.data)
  const documentId = new CID(snapshot.log.first);
  await user.did(decodeThrow(ThreeIdentifier, `did:3:${documentId.valueOf()}`));
  return user;
}

async function main() {
  const user = await createUser('0xf533035c3339782eb95ffdfb7f485ac2c74545033a7cb2a46b6c91f77ae33b8f');
  const tile = {
    doctype: 'tile' as 'tile',
    owners: [await user.did()],
    content: {},
  };
  console.log('to sign', sortKeys(tile))
  const jwt = await user.sign(sortKeys(tile));
  const signedTile = {
    ...tile,
    iss: await user.did(),
    header: jwt.header,
    signature: jwt.signature,
  };
  console.log('posting', signedTile)
  const genesisResponse = await axios.post(`${REMOTE_URL}/api/v0/ceramic`, signedTile);
  console.log('genesis response', genesisResponse.data);
  const snapshot = decodeThrow(SnapshotCodec(t.unknown), genesisResponse.data)
  const documentId = snapshot.log.first;
  await sleep(61000);
  const anchoredGenesisResponse = await axios.get(`${REMOTE_URL}/api/v0/ceramic/${documentId.toString()}`);
  const log = new History(anchoredGenesisResponse.data.log.map((cid) => new CID(cid)));
  const doc2 = Object.assign({}, tile);
  doc2.content = {
    foo: '33',
  };
  const delta = jsonPatch.compare(tile, doc2);
  console.log(delta);
  const updateRecord = {
    patch: delta,
    prev: log.last,
    id: documentId,
  };
  const updateRecordToSign = {
    patch: updateRecord.patch,
    prev: { '/': updateRecord.prev.valueOf().toString() },
    id: { '/': updateRecord.id.valueOf().toString() },
  };
  const jwtUpdate = await user.sign(updateRecordToSign);
  const updateRecordA = {
    ...updateRecordToSign,
    iss: await user.did(),
    header: jwtUpdate.header,
    signature: jwtUpdate.signature,
  };
  console.log('signed payload', updateRecordToSign);
  const updateResponse = await axios.put(`${REMOTE_URL}/api/v0/ceramic/${documentId.toString()}`, updateRecordA);
  console.log('update response', updateResponse.data);
}

main();
