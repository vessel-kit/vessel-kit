import { Ceramic } from '../ceramic';
import ipfsClient from 'ipfs-http-client';
import { ThreeIdContent } from '../three-id.content';
import { waitUntil } from './wait.util';
import IdentityWallet from 'identity-wallet';
import { Signor } from '../person/signor';
import { sleep } from './sleep.util';
import axios from 'axios';
import CID from 'cids';
import { Chain } from '../chain';

const IPFS_URL = 'http://localhost:5001';
const REMOTE_URL = 'http://localhost:3001';

const cborSortCompareFn = (a: string, b: string): number => a.length - b.length || a.localeCompare(b);

function sortPropertiesDeep(obj: any, compareFn: (a: any, b: any) => number = cborSortCompareFn): any {
  if (typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }
  return Object.keys(obj)
    .sort(compareFn)
    .reduce<Record<string, any>>((acc, prop) => {
      acc[prop] = sortPropertiesDeep(obj[prop], compareFn);
      return acc;
    }, {});
}

async function main() {
  const identityWallet = new IdentityWallet(() => true, {
    seed: '0xf533035c3339782eb95ffdfb7f485ac2c74545033a7cb2a46b6c91f77ae33b8f',
  });
  const user = new Signor(identityWallet.get3idProvider());
  await user.auth();

  const ownerKey = user.publicKeys.managementKey;
  const signingKey = user.publicKeys.signingKey;
  const encryptionKey = user.publicKeys.asymEncryptionKey;

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
  console.log('genesis record', genesisRecord)
  const genesisResponse = await axios.post(`${REMOTE_URL}/api/v0/ceramic`, genesisRecord);
  console.log('genesis response', genesisResponse.data);
  const documentId = new CID(genesisResponse.data.docId);
  await sleep(80000);
  const anchoredGenesisResponse = await axios.get(`${REMOTE_URL}/api/v0/ceramic/${documentId.toString()}`)
  const log = new Chain(anchoredGenesisResponse.data.log.map(cid => new CID(cid)))
  const doc2 = doc1.clone();
  doc2.publicKeys.set('foocryption', signingKey);
  const delta = doc2.delta(doc1);
  const updateRecord = {
    patch: delta,
    prev: log.last,
    id: documentId,
  };
  const updateRecordToSign = sortPropertiesDeep({
    patch: updateRecord.patch,
    prev: { '/': updateRecord.prev.valueOf().toString() },
    id: { '/': updateRecord.id.valueOf().toString() },
  });
  user.did = `did:3:${documentId.valueOf()}`;
  console.log('signing payload', updateRecordToSign);
  const jwt = await user.sign(updateRecordToSign, { useMgmt: true });
  const updateRecordA = {
    ...updateRecordToSign,
    iss: user.did,
    header: jwt.header,
    signature: jwt.signature,
  };
  const updateResponse = await axios.put(`${REMOTE_URL}/api/v0/ceramic/${documentId.toString()}`, updateRecordA);
  console.log('update response', updateResponse.data);
}

main();
