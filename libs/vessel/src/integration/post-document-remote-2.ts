import { ThreeIdContent } from '../three-id.content';
import IdentityWallet from 'identity-wallet';
import { User } from '../signor/user';
import { sleep } from './sleep.util';
import axios from 'axios';
import CID from 'cids';
import { Chain } from '../chain';
import { ThreeIdentifier, ThreeIdentifierCidCodec } from '../three-identifier';
import { decodeThrow } from '@potter/codec';
import { Client } from '../client';
import { ThreeId } from '../doctypes/three-id.doctype';
import { CeramicDocumentId } from '@potter/codec';

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
  const user = await User.build(identityWallet.get3idProvider());

  const client = new Client(REMOTE_URL);
  const document = await client.addSignor(user);
  console.log(document.state)
  await sleep(80000);
  // ThreeId.change(document, document.state)

  // const anchoredGenesisResponse = await axios.get(`${REMOTE_URL}/api/v0/ceramic/${documentId.toString()}`);
  // const log = new Chain(anchoredGenesisResponse.data.log.map((cid) => new CID(cid)));
  // const doc2 = doc1.clone();
  // doc2.publicKeys.set('foocryption', signingKey);
  // const delta = doc2.delta(doc1);
  // const updateRecord = {
  //   patch: delta,
  //   prev: log.last,
  //   id: documentId,
  // };
  // const updateRecordToSign = sortPropertiesDeep({
  //   patch: updateRecord.patch,
  //   prev: { '/': updateRecord.prev.valueOf().toString() },
  //   id: { '/': updateRecord.id.valueOf().toString() },
  // });
  // await user.did(decodeThrow(ThreeIdentifier, `did:3:${documentId.valueOf()}`));
  // console.log('signing payload', updateRecordToSign);
  // const jwt = await user.sign(updateRecordToSign, { useMgmt: true });
  // const updateRecordA = {
  //   ...updateRecordToSign,
  //   iss: user.did,
  //   header: jwt.header,
  //   signature: jwt.signature,
  // };
  // const updateResponse = await axios.put(`${REMOTE_URL}/api/v0/ceramic/${documentId.toString()}`, updateRecordA);
  // console.log('update response', updateResponse.data);
}

main();
