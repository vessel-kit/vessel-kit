import { Ceramic } from '../ceramic';
import ipfsClient from 'ipfs-http-client';
import { ThreeIdContent } from '../three-id.content';
import { waitUntil } from './wait.util';
import { AnchoringStatus } from '..';
import IdentityWallet from 'identity-wallet';
import { Signor } from '../person/signor';

const IPFS_URL = 'http://localhost:5001';
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

  const ceramic = await Ceramic.build(ipfs);

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
  const document = await ceramic.create(genesisRecord);
  console.log('Present state', document.state);
  console.log('Waiting some time for anchoring...');
  await waitUntil(5000, async () => {
    return document.state.anchor.status === AnchoringStatus.ANCHORED;
  });
  console.log(`Present state`, document.state);
  const doc2 = doc1.clone();
  doc2.publicKeys.set('foocryption', signingKey);
  const delta = doc2.delta(doc1);
  // TODO Signature encoding
  const updateRecord = {
    patch: delta,
    prev: document.state.log.last,
    id: document.id.cid,
  };
  const updateRecordToSign = sortPropertiesDeep({
    patch: delta,
    prev: { '/': document.state.log.last.toString() },
    id: { '/': document.id.valueOf() },
  });
  user.did = `did:3:${document.id.valueOf()}`;
  const a = await user.sign(updateRecordToSign, { useMgmt: true });
  const updateRecordA = {
    ...updateRecord,
    iss: user.did,
    header: a.header,
    signature: a.signature,
  };
  await document.update(updateRecordA);
  // localUser.signManagement(updateRecord);
}

main();
