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

async function createUser(seed: string) {
  const identityWallet = new IdentityWallet(() => true, {
    seed: seed,
  });

  return User.build(identityWallet.get3idProvider());
}

async function main() {
  const userA = await createUser('0xf533035c3339782eb95ffdfb7f485ac2c74545033a7cb2a46b6c91f77ae33b8f');
  await clientA.addSignor(userA);
  const userB = await createUser('0x2220000000000000000000000000000000000000000000000000000000000000');
  await clientB.addSignor(userB)

  const rulesetFile = path.join(__dirname, './tmp-ruleset.ts');
  const props = await VesselRulesetAlphaDoctype.genesisFromRulesetFile(rulesetFile);
  console.log('props', props)
  const signed = await clientA.context.sign(props)
  console.log('signed', signed)
  const rulesetDocument = await clientA.create(signed)
  const payload = {
    num: 100,
    stage: 'draft' as 'draft'
  }
  const signedPayload = await clientA.context.sign(payload)

  const vesselDocumentPayload: VesselDocumentShapeBase = {
    doctype: 'vessel/document/1.0.0',
    ruleset: rulesetDocument.id.toString(),
    content: {
      payload: _.omit(payload, 'iss', 'iat'),
      partyA: {
        iss: signedPayload.iss,
        header: signedPayload.header,
        signature: signedPayload.signature
      }
    }
  }
  const vesselDocumentPayloadSigned = await clientA.context.sign(vesselDocumentPayload)
  const vesselDocumentRaw = await clientA.create(vesselDocumentPayloadSigned)
  const vesselDocument = await VesselDocument.fromDocument(vesselDocumentRaw)
  console.log('sleeping...')
  await sleep(2000)
  await vesselDocument.change(async shape => {
    shape.content.payload.num = shape.content.payload.num + 100
    const signed = await clientA.context.sign(shape.content.payload)
    shape.content.payload = {
      stage: shape.content.payload.stage,
      num: shape.content.payload.num
    }
    shape.content.partyA = {
      header: signed.header,
      iss: signed.iss,
      signature: signed.signature
    }
    return shape
  })
  console.log('sleeping B...')
  await sleep(2000)
  const vesselDocumentRawB = await clientB.load(vesselDocument.document.id)
  const vesselDocumentB = await VesselDocument.fromDocument(vesselDocumentRawB)
  await vesselDocumentB.change(async shape => {
    shape.content.payload.num = shape.content.payload.num + 100
    const signed = await clientB.context.sign(shape.content.payload)
    shape.content.payload = {
      stage: shape.content.payload.stage,
      num: shape.content.payload.num
    }
    shape.content.partyB = {
      header: signed.header,
      iss: signed.iss,
      signature: signed.signature
    }
    return shape
  })
  console.log('sleeping 2...')
  await sleep(2000)
  await vesselDocument.change(async shape => {
    shape.content.payload = {
      stage: 'agreement',
      num: shape.content.payload.num
    }
    const signed = await clientA.context.sign(shape.content.payload)
    shape.content.payload = {
      stage: 'agreement',
      num: shape.content.payload.num
    }
    shape.content.partyA = {
      header: signed.header,
      iss: signed.iss,
      signature: signed.signature
    }
    return shape
  })
  console.log('sleeping after agreement is set. call should fail...')
  await sleep(2000)
  try {
    await vesselDocument.change(async shape => {
      shape.content.payload = {
        stage: 'agreement',
        num: shape.content.payload.num + 100
      }
      const signed = await clientA.context.sign(shape.content.payload)
      shape.content.payload = {
        stage: 'agreement',
        num: shape.content.payload.num
      }
      shape.content.partyA = {
        header: signed.header,
        iss: signed.iss,
        signature: signed.signature
      }
      return shape
    })
  } catch (e) {
    console.log('Really failed. Cool.')
  }
  console.log(JSON.stringify(vesselDocument.document.state, null, 4))
  console.log(JSON.stringify(vesselDocumentB.document.state, null, 4))
}

main().finally(() => {
  clientA.close();
  clientB.close();
});
