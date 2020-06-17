import { Ceramic } from '../ceramic';
import ipfsClient from 'ipfs-http-client';
import { ThreeIdContent } from '../three-id.content';
import { waitUntil } from './wait.util';
import { AnchoringStatus } from '..';
import IdentityWallet from 'identity-wallet';
import { Signor } from '../person/signor';
import { sleep } from './sleep.util';
import axios from 'axios';
import CID from 'cids';

const IPFS_URL = 'http://localhost:5001';
const REMOTE_URL = 'http://localhost:3001';
const ipfs = ipfsClient(IPFS_URL);

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

  // const ceramic = await Ceramic.build(ipfs);

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
  const response = await axios.post(`${REMOTE_URL}/api/v0/ceramic`, genesisRecord);
  console.log('respo', response.data);
  const documentId = new CID(response.data.docId);
  await sleep(2000);
  // const document = await ceramic.create(genesisRecord);
  // console.log('Present state', document.state);
  // console.log('Waiting some time for anchoring...');
  // await waitUntil(5000, async () => {
  //   return document.state.anchor.status === AnchoringStatus.ANCHORED;
  // });
  // console.log(`Present state`, document.state);
  const doc2 = doc1.clone();
  doc2.publicKeys.set('foocryption', signingKey);
  const delta = doc2.delta(doc1);
  const updateRecord = {
    patch: delta,
    prev: documentId,
    id: documentId,
  };
  const updateRecordToSign = sortPropertiesDeep({
    patch: delta,
    prev: { '/': documentId.valueOf().toString() },
    id: { '/': documentId.valueOf().toString() },
  });
  user.did = `did:3:${documentId.valueOf()}`;
  console.log('signing payload', updateRecordToSign)
  const a = await user.sign(updateRecordToSign, { useMgmt: true });
  const updateRecordA = {
    ...updateRecord,
    prev: { '/': updateRecord.prev.toString() },
    id: { '/': updateRecord.id.toString() },
    iss: user.did,
    header: a.header,
    signature: a.signature,
  };
  const updateResponse = await axios.put(`${REMOTE_URL}/api/v0/ceramic/${documentId.toString()}`, updateRecordA);
  console.log('respo', updateResponse.data);
  // await document.update(updateRecordA);
  // await sleep(20000)
}

main();
