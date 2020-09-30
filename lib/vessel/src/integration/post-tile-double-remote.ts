import IdentityWallet from 'identity-wallet';
import { User } from '../signor/user';
import { sleep } from './sleep.util';
import { Client } from '../remote/client';
import { Tile } from '../doctypes/tile/tile';

const REMOTE_URL = 'http://localhost:3001';
const clientA = new Client(REMOTE_URL);
const clientB = new Client(REMOTE_URL);

async function createUser(seed: string) {
  const identityWallet = new IdentityWallet(async () => true, {
    seed: seed,
  });

  return User.build(identityWallet.get3idProvider());
}

async function main() {
  const userA = await createUser('0x1110000000000000000000000000000000000000000000000000000000000000');
  await clientA.addSignor(userA);
  const userB = await createUser('0x2220000000000000000000000000000000000000000000000000000000000000');
  await clientB.addSignor(userB);
  const didA = await userA.did();
  const didB = await userB.did();
  if (!didA || !didB) {
    throw new Error(`Empty DID`);
  }
  const tile = await Tile.create(clientA.create, clientA.context, {
    owners: [didA.toString(), didB.toString()],
    content: {},
  });
  await sleep(61000);
  const docB = await clientB.load(tile.document.id);
  const tileB = await Tile.fromDocument(docB);
  await tileB.change((shape) => {
    return {
      ...shape,
      content: {
        foo: 33,
      },
    };
  });
  await sleep(20000);
  clientB.close();
  clientA.close();
}

main();
