import { Ceramic } from '../ceramic';
import ipfsClient from 'ipfs-http-client';
import { ThreeIdContent } from '../three-id.content';
import { waitUntil } from './wait.util';
import { AnchoringStatus } from '..';
import { KeyPrecious } from '../person/key-precious';
import IdentityWallet from 'identity-wallet';
import { LocalUser } from '../person/local.user';

const IPFS_URL = 'http://localhost:5001';
const ipfs = ipfsClient(IPFS_URL);

async function main() {
  const identityWallet = new IdentityWallet(() => true, {
    seed: '0xf533035c3339782eb95ffdfb7f485ac2c74545033a7cb2a46b6c91f77ae33b8f',
  });
  const localUser = await LocalUser.fromIdentityWallet(identityWallet);
  return

  const ceramic = await Ceramic.build(ipfs);

  const ownerKey = await localUser.keyPrecious.managementKey();
  const signingKey = await localUser.keyPrecious.signingKey();
  const encryptionKey = await localUser.keyPrecious.asymEncryptionKey();

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
    patch: delta,
    prev: document.state.log.last,
  };
  localUser.signManagement(updateRecord);
}

main();
