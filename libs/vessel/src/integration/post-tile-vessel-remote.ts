import { ThreeIdContent } from '../three-id.content';
import IdentityWallet from 'identity-wallet';
import { User } from '../signor/user';
import { sleep } from './sleep.util';
import axios from 'axios';
import CID from 'cids';
import { Chain } from '../util/chain';
import jsonPatch from 'fast-json-patch';
import { ThreeIdentifier } from '../three-identifier';
import { decodeThrow } from '@potter/codec';

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
  const documentId = new CID(genesisResponse.data.docId);
  await user.did(decodeThrow(ThreeIdentifier, `did:3:${documentId.valueOf()}`));
  return user;
}

async function main() {
  const user = await createUser('0xf533035c3339782eb95ffdfb7f485ac2c74545033a7cb2a46b6c91f77ae33b8f');
  const ruleset = {
    doctype: 'vessel/ruleset/0.0.1',
    content: {
      type: 'application/javascript',
      main: `function canApply(a, b) { return b.content.num > a.content.num; }; module.exports = {canApply: canApply}`,
    },
  };
  const genesisResponse = await axios.post(`${REMOTE_URL}/api/v0/ceramic`, ruleset);
  console.log('genesis response', genesisResponse.data);
  const rulesetId = new CID(genesisResponse.data.docId);
  console.log(`document Id`, rulesetId);

  const doc1 = {
    doctype: 'vessel/document/0.0.1',
    owners: [user.did],
    governance: rulesetId.toString(),
    content: {
      num: 1,
    },
  };
  const jwt = await user.sign(sortPropertiesDeep(doc1));
  const signedDocument = {
    ...doc1,
    iss: user.did,
    header: jwt.header,
    signature: jwt.signature,
  };
  const genesisSignedDocument = await axios.post(`${REMOTE_URL}/api/v0/ceramic`, signedDocument);
  const documentId = new CID(genesisSignedDocument.data.docId);

  await sleep(80000);
  const anchoredDocument = await axios.get(`${REMOTE_URL}/api/v0/ceramic/${documentId.toString()}`);
  const log = new Chain(anchoredDocument.data.log.map((cid) => new CID(cid)));
  const anchoredDocumentId = new CID(anchoredDocument.data.docId);

  const doc2: any = JSON.parse(JSON.stringify(doc1));
  doc2.content.num = 2;
  console.log('prepatch', doc1, doc2);
  const delta = jsonPatch.compare(doc1, doc2);
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
  const jwtUpdate = await user.sign(updateRecordToSign);
  const updateRecordA = {
    ...updateRecordToSign,
    iss: user.did,
    header: jwtUpdate.header,
    signature: jwtUpdate.signature,
  };
  const updateResponse = await axios.put(`${REMOTE_URL}/api/v0/ceramic/${documentId.toString()}`, updateRecordA);
  console.log('update response', updateResponse.data);
}

main();
