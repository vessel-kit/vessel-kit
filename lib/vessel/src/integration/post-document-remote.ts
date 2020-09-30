import IdentityWallet from 'identity-wallet';
import { User } from '../signor/user';
import { sleep } from './sleep.util';
import { Client } from '../remote/client';
import { ThreeId } from '../doctypes/three-id/three-id';
import * as jose from 'jose';

const REMOTE_URL = 'http://localhost:3001';

async function main() {
  const identityWallet = new IdentityWallet(async () => true, {
    seed: '0xf533035c3339782eb95ffdfb7f485ac2c74545033a7cb2a46b6c91f77ae33b8f',
  });
  const user = await User.build(identityWallet.get3idProvider());

  const client = new Client(REMOTE_URL);
  const document = await client.addSignor(user);
  const threeId = await ThreeId.fromDocument(document);
  console.log('initial', document);
  await sleep(61000);
  console.log('initial after wait', document);
  await threeId.updatePublicKeys({
    ...threeId.publicKeys,
    encryption: jose.JWK.generateSync('OKP', 'X25519'),
  });
  console.log('after update', document);
  await sleep(61000);
  console.log('updated', document);
  client.close();
}

main();