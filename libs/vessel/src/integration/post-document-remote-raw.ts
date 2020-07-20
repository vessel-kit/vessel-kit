import { ThreeIdContent } from '../three-id.content';
import IdentityWallet from 'identity-wallet';
import { User } from '../signor/user';
import { sleep } from './sleep.util';
import axios from 'axios';
import { ThreeIdentifier } from '../three-identifier';
import { decodeThrow } from '@potter/codec';
import { DocumentState } from '..';

const REMOTE_URL = 'http://localhost:3001';

async function main() {
  const identityWallet = new IdentityWallet(() => true, {
    seed: '0xf533035c3339782eb95ffdfb7f485ac2c74545033a7cb2a46b6c91f77ae33b8f',
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
  console.log('genesis record', genesisRecord);
  const genesisResponse = await axios.post(`${REMOTE_URL}/api/v0/ceramic`, genesisRecord);
  const genesisState = decodeThrow(DocumentState, genesisResponse.data);
  console.log('genesis response', genesisResponse.data);
  const documentId = genesisState.log.first;
  await sleep(80000);
  const anchoredGenesisResponse = await axios.get(`${REMOTE_URL}/api/v0/ceramic/${documentId.toString()}`);
  const state = decodeThrow(DocumentState, anchoredGenesisResponse.data);
  const log = state.log;
  const doc2 = doc1.clone();
  doc2.publicKeys.set('foocryption', signingKey);
  const delta = doc2.delta(doc1);
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
  await user.did(decodeThrow(ThreeIdentifier, `did:3:${documentId.valueOf()}`));
  console.log('signing payload', updateRecordToSign);
  const jwt = await user.sign(updateRecordToSign, { useMgmt: true });
  const updateRecordA = {
    ...updateRecordToSign,
    iss: await user.did(),
    header: jwt.header,
    signature: jwt.signature,
  };
  const updateResponse = await axios.put(`${REMOTE_URL}/api/v0/ceramic/${documentId.toString()}`, updateRecordA);
  console.log('update response', updateResponse.data);
}

main();
