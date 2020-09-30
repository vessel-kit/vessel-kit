import IdentityWallet from 'identity-wallet';
import { User } from '../signor/user';
import { sleep } from './sleep.util';
import { Client } from '../remote/client';
import { Tile } from '../doctypes/tile/tile';

const REMOTE_URL = 'http://localhost:3001';
const client = new Client(REMOTE_URL);

async function main() {
  const identityWallet = new IdentityWallet(async () => true, {
    seed: '0xf533035c3339782eb95ffdfb7f485ac2c74545033a7cb2a46b6c91f77ae33b8f',
  });
  const user = await User.build(identityWallet.get3idProvider());
  await client.addSignor(user);
  const did = await user.did()
  if (!did) {
    throw new Error(`Empty DID`)
  }
  console.log('foo', did.toString())
  const tile = await Tile.create(client.create, client.context, {
    owners: [did.toString()],
    content: {},
  });
  tile.document.state$.subscribe((state) => {
    console.log(new Date().toLocaleTimeString(), state);
  });
  await sleep(65000);
  await tile.change( (shape) => {
    return {
      ...shape,
      content: {
        foo: 33,
      },
    };
  });
  await sleep(65000);
  client.close();
}

main();
