import IdentityWallet from 'identity-wallet';
import { User } from '../signor/user';
import { sleep } from './sleep.util';
import { Client } from '../remote/client';
import { VesselRulesetAlpha } from '../doctypes/vessel-ruleset-alpha';
import { VesselDocumentAlpha } from '../doctypes/vessel-document-alpha';

const REMOTE_URL = 'http://localhost:3001';
const client = new Client(REMOTE_URL);

async function main() {
  const identityWallet = new IdentityWallet(() => true, {
    seed: '0xf533035c3339782eb95ffdfb7f485ac2c74545033a7cb2a46b6c91f77ae33b8f',
  });
  const user = await User.build(identityWallet.get3idProvider());
  await client.addSignor(user);

  const ruleset = await client.createAs(VesselRulesetAlpha, {
    content: {
      type: 'application/javascript',
      main: `function canApply(current, next) { if (current && current.content) { return next.content.num > current.content.num; } else { return true} } module.exports = {canApply: canApply}`,
    },
  });
  const document = await client.createAs(VesselDocumentAlpha, {
    governance: ruleset.document.id.cid,
    content: {
      num: 100,
    },
  });
  await sleep(10000);
  await document.update({
    ...document.current,
    content: {
      num: 200,
    },
  });
  client.close();
}

main().finally(() => {
  client.close();
});
