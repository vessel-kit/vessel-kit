import IdentityWallet from 'identity-wallet';
import { User } from '../signor/user';
import { sleep } from './sleep.util';
import { Client } from '../remote/client';
import { VesselRulesetAlphaDoctype } from '../doctypes/vessel-ruleset-alpha-doctype';
import { VesselDocument, VesselDocumentShapeBase } from '../doctypes/vessel-document-alpha-doctype';
import * as path from 'path';
import * as _ from 'lodash'

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
  const payload = {
    num: 100
  }
  const signedPayload = await clientA.context.sign(payload)

  const vesselDocumentPayload: VesselDocumentShapeBase = {
    doctype: 'vessel/document/1.0.0',
    ruleset: rulesetDocument.id.toString(),
    content: {
      payload: _.omit(payload, 'iss', 'iat'),
      party: {
        iss: signedPayload.iss,
        header: signedPayload.header,
        signature: signedPayload.signature
      }
    }
  }
  const vesselDocumentPayloadSigned = await clientA.context.sign(vesselDocumentPayload)
  const vesselDocumentRaw = await clientA.create(vesselDocumentPayloadSigned)
  const vesselDocument = await VesselDocument.fromDocument(vesselDocumentRaw)
  await sleep(2000)
  await vesselDocument.change(async shape => {
    shape.content.payload.num = shape.content.payload.num + 100
    const signed = await clientA.context.sign(shape.content.payload)
    shape.content.payload = {
      num: shape.content.payload.num
    }
    shape.content.party = {
      header: signed.header,
      iss: signed.iss,
      signature: signed.signature
    }
    return shape
  })
  await sleep(2000)
  console.log(JSON.stringify(vesselDocument.document.state, null, 4))
}

main().finally(() => {
  clientA.close();
  clientB.close();
});
