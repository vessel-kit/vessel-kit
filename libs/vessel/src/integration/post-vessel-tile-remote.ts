// import IdentityWallet from 'identity-wallet';
// import { User } from '../signor/user';
// import { sleep } from './sleep.util';
// import { Client } from '../remote/client';
// import { VesselRulesetAlpha } from '../doctypes/vessel-ruleset-alpha';
// import { VesselDocumentAlpha } from '../doctypes/vessel-document-alpha';
// import * as path from 'path';
//
// const REMOTE_URL = 'http://localhost:3001';
// const client = new Client(REMOTE_URL);
//
// async function main() {
//   const identityWallet = new IdentityWallet(() => true, {
//     seed: '0xf533035c3339782eb95ffdfb7f485ac2c74545033a7cb2a46b6c91f77ae33b8f',
//   });
//   const user = await User.build(identityWallet.get3idProvider());
//   await client.addSignor(user);
//
//   const rulesetFile = path.join(__dirname, './tmp-ruleset.ts');
//   const props = await VesselRulesetAlpha.genesisFromRulesetFile(rulesetFile);
//   console.log('props', props)
//   const ruleset = await client.createAs(VesselRulesetAlpha, props);
//   const document = await client.createAs(VesselDocumentAlpha, {
//     ruleset: ruleset.document.id.cid,
//     content: {
//       num: 100,
//     },
//   });
//   console.log('published', document.current)
//   await sleep(61000);
//   await document.update({
//     ...document.current,
//     content: {
//       num: 20,
//     },
//   });
//   console.log('updated', document.current)
//   client.close();
// }
//
// main().finally(() => {
//   client.close();
// });
