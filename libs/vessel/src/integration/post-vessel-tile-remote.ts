import IdentityWallet from 'identity-wallet';
import { User } from '../signor/user';
import { sleep } from './sleep.util';
import { Client } from '../remote/client';
import { VesselRulesetAlphaDoctype } from '../doctypes/vessel-ruleset-alpha-doctype';
import {
  VesselDocument,
  TwoPartyShape,
  VesselDocumentShape,
  TwoPartyState,
} from '../doctypes/vessel-document-alpha-doctype';
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
  const signed = await clientA.context.sign(props)
  const rulesetDocument = await clientA.create(signed)
  const payload = {
    num: 100,
  }
  const signedPayload = await clientA.context.sign(payload)

  // I. Create document
  const vesselDocumentPayload: VesselDocumentShape<TwoPartyShape> = {
    doctype: 'vessel/document/1.0.0',
    ruleset: rulesetDocument.id.toString(),
    content: {
      payload: _.omit(payload, 'iss', 'iat'),
      partyA: {
        iss: signedPayload.iss,
        header: signedPayload.header,
        signature: signedPayload.signature
      },
      stage: 'draft'
    }
  }
  const vesselDocumentPayloadSigned = await clientA.context.sign(vesselDocumentPayload)
  const vesselDocumentRaw = await clientA.create(vesselDocumentPayloadSigned)
  const vesselDocument = await VesselDocument.fromDocument<TwoPartyState, TwoPartyShape>(vesselDocumentRaw)
  console.log('sleeping...')
  await sleep(2000)

  // I. Change num to 200, sigA
  await vesselDocument.change(async shape => {
    shape.payload.num = shape.payload.num + 100
    const signed = await clientA.context.sign(shape.payload)
    shape.payload = {
      num: shape.payload.num
    }
    shape.partyA = {
      header: signed.header,
      iss: signed.iss,
      signature: signed.signature
    }
    return shape
  })

  console.log('Change num to 300, sigB...')
  await sleep(2000)
  const vesselDocumentRawB = await clientB.load(vesselDocument.document.id)
  const vesselDocumentB = await VesselDocument.fromDocument<TwoPartyState, TwoPartyShape>(vesselDocumentRawB)
  await vesselDocumentB.change(async shape => {
    shape.payload.num = shape.payload.num + 100
    const signed = await clientB.context.sign(shape.payload)
    shape.payload = {
      num: shape.payload.num
    }
    shape.partyB = {
      header: signed.header,
      iss: signed.iss,
      signature: signed.signature
    }
    return shape
  })

  console.log('Same num, sigA...')
  await sleep(20000)
  await vesselDocument.change(async shape => {
    shape.payload = {
      num: shape.payload.num
    }
    const signed = await clientA.context.sign(shape.payload)
    shape.payload = {
      num: shape.payload.num
    }
    shape.partyA = {
      header: signed.header,
      iss: signed.iss,
      signature: signed.signature
    }
    return shape
  })

  await sleep(10000)

  console.log('sleeping after agreement is set. call should fail...')
  await sleep(20000)
  try {
    await vesselDocument.change(async shape => {
      shape.payload = {
        num: shape.payload.num + 100
      }
      const signed = await clientA.context.sign(shape.payload)
      shape.payload = {
        num: shape.payload.num
      }
      shape.partyA = {
        header: signed.header,
        iss: signed.iss,
        signature: signed.signature
      }
      return shape
    })
  } catch (e) {
    console.log('Really failed. Cool.')
  }
}

main().finally(() => {
  clientA.close();
  clientB.close();
});
