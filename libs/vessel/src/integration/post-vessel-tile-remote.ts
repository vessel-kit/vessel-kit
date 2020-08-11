import IdentityWallet from 'identity-wallet';
import { User } from '../signor/user';
import { sortKeys } from '../util/sort-keys'
import { sleep } from './sleep.util';
import { Client } from '../remote/client';
import { VesselRulesetAlpha } from '../doctypes/vessel-ruleset-alpha';
import { VesselDocumentAlpha } from '../doctypes/vessel-document-alpha';
import * as path from 'path';
import base64url from 'base64url';
import { sha256 as sha256js, Message } from 'js-sha256'

export function sha256(payload: Message): Buffer {
  return Buffer.from(sha256js.arrayBuffer(payload))
}

const REMOTE_URL = 'http://localhost:3001';
const client = new Client(REMOTE_URL);

const strinfy = function(obj) {
  return JSON.stringify(obj,function(key, value){
    return (typeof value === 'function' ) ? value.toString() : value;
  });
}

async function main() {
  const identityWallet = new IdentityWallet(() => true, {
    seed: '0xf533035c3339782eb95ffdfb7f485ac2c74545033a7cb2a46b6c91f77ae33b8f',
  });

  console.log('YY = ' + strinfy(identityWallet))
  const user = await User.build(identityWallet.get3idProvider());
  await client.addSignor(user);
  console.log('YYUser = ' + strinfy(user))

  const rulesetFile = path.join(__dirname, './tmp-ruleset.ts');
  const props = await VesselRulesetAlpha.genesisFromRulesetFile(rulesetFile);
  console.log('props', props)
  const ruleset = await client.createAs(VesselRulesetAlpha, props);
  console.log('12')

  const recordToSign = {
    ruleset: ruleset.document.id.cid.toString(),
    content: {
      payload: {
        num: 100
      }
    },
    iss: 'did:3:bafyreic3pjr64v764qezetbqbyd66djmbhzlbkqr7e3cpceomagkghed2a'
  }

  console.log('$$$recordToSign = ' + JSON.stringify(recordToSign))

  console.log('@@user.did === ' + JSON.stringify(await user.did()))
  console.log('@@user.pubs === ' + JSON.stringify(await user.publicKeys()))
  console.log('@@user.pubs.public === ' + JSON.stringify((await user.publicKeys())['signingKey'].toPEM(false)))
    // ,
    // party: {
    //   iss: 'did:3:bafyreibedfxqj6e2lhj6fmrxpxvkn3qogzh65247udaz7vq5jb3os4cnxe',
    //   header: {typ: 'JWK', alg: 'ES256K'},
    //   signature: 'xxxx'
    // }
  const a = await user.sign(sortKeys(recordToSign), { useMgmt: true });
  // const a = await user.sign({
  //   iss: 'did:3:bafyreibedfxqj6e2lhj6fmrxpxvkn3qogzh65247udaz7vq5jb3os4cnxe'
  // }, { useMgmt: true });
  console.log('+++ a = ' +JSON.stringify(a))
  // const signedTile = {
  //   ...recordToSign,
  //   iss: user.did,
  //   header: jwt.header,
  //   signature: jwt.signature,
  // };
  const recordSigned = {
    ruleset: a.payload.ruleset,
    content: {
      payload: {
        ...a.payload.content.payload
      },
      party: {
        iss: a.payload.iss,
        header: a.header,
        signature: a.signature
      }
    }
  };

  console.log('Record SIGNED: + ' + JSON.stringify(recordSigned))
  const document = await client.createAs(VesselDocumentAlpha, recordSigned);
  console.log('published', document.current)
  // await sleep(18000);
  // await document.update({
  //   ...document.current,
  //   content: {
  //     payload: {
  //       num: 203
  //     },
  //     party: {
  //       iss: 'did:3:bafyreibedfxqj6e2lhj6fmrxpxvkn3qogzh65247udaz7vq5jb3os4cnxe',
  //       header: {typ: 'JWK', alg: 'ES256K'},
  //       signature: 'xxxx'
  //     }
  //   },
  // });
  // console.log('updated', document.current)
  client.close();
}

main().finally(() => {
  client.close();
});
