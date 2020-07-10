import { ThreeIdContent } from '../three-id.content';
import IdentityWallet from 'identity-wallet';
import { Signor } from '../person/signor';
import { sleep } from './sleep.util';
import axios from 'axios';
import CID from 'cids';
import { Chain } from '../chain';
import * as t from 'io-ts';
import { TileContent } from '../tile.content';
import { ThreeIdentifier } from '../three-identifier';

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
  const user = await Signor.build(identityWallet.get3idProvider());

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
  const genesisResponse = await axios.post(`${REMOTE_URL}/api/v0/ceramic`, genesisRecord);
  const documentId = new CID(genesisResponse.data.docId);
  user.did = `did:3:${documentId.valueOf()}`;
  return user;
}

async function main() {
  const user = await createUser('0xf533035c3339782eb95ffdfb7f485ac2c74545033a7cb2a46b6c91f77ae33b8f');
  const tile = {
    doctype: 'tile' as 'tile',
    owners: [ThreeIdentifier.fromString(user.did)],
    content: {},
  };
  const encodedTile = TileContent.encode(tile);
  const jwt = await user.sign(sortPropertiesDeep(encodedTile));
  const signedTile  = {
    ...encodedTile,
    iss: user.did,
    header: jwt.header,
    signature: jwt.signature,
  };
  const genesisResponse = await axios.post(`${REMOTE_URL}/api/v0/ceramic`, signedTile);
}

main();
