import IdentityWallet from 'identity-wallet';
import { User } from '../signor/user';
import { sleep } from './sleep.util';
import { Client } from '../client';
import { ThreeIdA } from '../doctypes/three-id.doctype';
import * as jose from 'jose'

const REMOTE_URL = 'http://localhost:3001';

async function main() {
  const identityWallet = new IdentityWallet(() => true, {
    seed: '0xf533035c3339782eb95ffdfb7f485ac2c74545033a7cb2a46b6c91f77ae33b8f',
  });
  const user = await User.build(identityWallet.get3idProvider());

  const client = new Client(REMOTE_URL);
  const document = await client.addSignor(user);
  const threeId = document.as(ThreeIdA)
  console.log('initial', document.state)
  await sleep(80000);
  console.log('initial after wait', document.state)
  await threeId.change({
    ...threeId.state,
    content: {
      publicKeys: {
        ...threeId.state.content.publicKeys,
        encryption: jose.JWK.generateSync('OKP', 'X25519')
      }
    }
  })
  console.log('after update', document.state)
  await sleep(80000);
  console.log('updated', document.state)
  client.close()
}

main();