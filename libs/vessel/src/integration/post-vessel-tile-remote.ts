import IdentityWallet from 'identity-wallet';
import { User } from '../signor/user';
import { sleep } from './sleep.util';
import { Client } from '../remote/client';
import { VesselRulesetAlphaDoctype } from '../doctypes/vessel-ruleset-alpha-doctype';
import { VesselDocument, VesselDocumentAlphaDoctype } from '../doctypes/vessel-document-alpha-doctype';
import * as path from 'path';

const REMOTE_URL = 'http://localhost:3001';
const clientA = new Client(REMOTE_URL);
const clientB = new Client(REMOTE_URL);

async function main() {
  const identityWallet = new IdentityWallet(() => true, {
    seed: '0xf533035c3339782eb95ffdfb7f485ac2c74545033a7cb2a46b6c91f77ae33b8f',
  });
  const userA = await User.build(identityWallet.get3idProvider());
  await clientA.addSignor(userA);

  const rulesetFile = path.join(__dirname, './tmp-ruleset.ts');
  const props = await VesselRulesetAlphaDoctype.genesisFromRulesetFile(rulesetFile);
  console.log('props', props)
  const signed = await clientA.context.sign(props)
  console.log('signed', signed)
  const rulesetDocument = await clientA.create(signed)

  const vesselDocumentPayload = {
    doctype: 'vessel/document/1.0.0',
    ruleset: rulesetDocument.id.toString(),
    content: {
      num: 100
    }
  }
  const vesselDocumentPayloadSigned = await clientA.context.sign(vesselDocumentPayload)
  const vesselDocumentRaw = await clientA.create(vesselDocumentPayloadSigned)
  const vesselDocument = await VesselDocument.fromDocument(vesselDocumentRaw)
  await vesselDocument.change(shape => {
    shape.content.num = shape.content.num + 100
    return shape
  })
  await sleep(2000)
  console.log(JSON.stringify(vesselDocument.document.state, null, 4))
  // const ruleset = await client.createAs(VesselRulesetAlpha, props);
//   const document = await client.createAs(VesselDocumentAlphaDoctype, {
//     ruleset: ruleset.document.id.cid,
//     content: {
//       num: 100,
//     },
//   });
//   console.log('published', document.view)
//   await sleep(61000);
//   await document.update({
//     ...document.view,
//     content: {
//       num: 20,
//     },
//   });
//   console.log('updated', document.view)
//   client.close();
}

main().finally(() => {
  clientA.close();
  clientB.close();
});
