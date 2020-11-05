import { sleep } from "./sleep.util";
import {
  Client,
  VesselDocument,
  VesselDocumentShape,
} from "@vessel-kit/vessel";
import * as _ from "lodash";
import { TwoPartyShape, TwoPartyState } from "two-party-agreement";
import {
  AlgorithmKind,
  KeyIdentity,
  PrivateKeyFactory,
} from "@vessel-kit/identity";
import { VesselRulesetAlphaDoctype } from "@vessel-kit/vessel";

const REMOTE_URL = "http://localhost:3001";
const clientA = new Client(REMOTE_URL);
const clientB = new Client(REMOTE_URL);

const privateKeyFactory = new PrivateKeyFactory();

async function createUser(seed: string) {
  const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, seed);
  return new KeyIdentity(privateKey);
}

async function main() {
  const userA = await createUser(
    "0xf533035c3339782eb95ffdfb7f485ac2c74545033a7cb2a46b6c91f77ae33b8f"
  );
  await clientA.addSignor(userA);
  const userB = await createUser(
    "0x2220000000000000000000000000000000000000000000000000000000000000"
  );
  await clientB.addSignor(userB);
  const genesis = VesselRulesetAlphaDoctype.genesisFromProps(
    require("two-party-agreement/__vessel.json")
  );

  // const rulesetFile = path.join(__dirname, "./tmp-ruleset/tmp-ruleset.ts");
  // const props = await VesselRulesetAlphaDoctype.genesisFromRulesetFile(
  //   rulesetFile
  // );
  const signed = await clientA.context.sign(genesis);
  const rulesetDocument = await clientA.create(
    Object.assign(genesis, { signature: signed })
  );
  const payload = {
    num: 100,
  };
  const signature = await clientA.context.sign(payload);

  // I. Create document
  const vesselDocumentPayload: VesselDocumentShape<TwoPartyShape> = {
    doctype: "vessel/document/1.0.0",
    ruleset: rulesetDocument.id.toString(),
    content: {
      payload: _.omit(payload, "iss", "iat"),
      partyA: signature,
      stage: "draft",
    },
  };
  const vesselDocumentPayloadSignature = await clientA.context.sign(
    vesselDocumentPayload
  );
  const vesselDocumentRaw = await clientA.create(
    Object.assign(vesselDocumentPayload, {
      signature: vesselDocumentPayloadSignature,
    })
  );
  console.log("Vessel document id", vesselDocumentRaw.id);
  const vesselDocument = await VesselDocument.fromDocument<
    TwoPartyState,
    TwoPartyShape
  >(vesselDocumentRaw);
  console.log("sleeping...");
  await sleep(2000);

  // I. Change num to 200, sigA
  await vesselDocument.change(async (shape) => {
    shape.payload.num = shape.payload.num + 100;
    shape.partyA = await clientA.context.sign(shape.payload);
    return shape;
  });

  console.log("Change num to 300, sigB...");
  await sleep(2000);
  const vesselDocumentRawB = await clientB.load(vesselDocument.document.id);
  const vesselDocumentB = await VesselDocument.fromDocument<
    TwoPartyState,
    TwoPartyShape
  >(vesselDocumentRawB);
  await vesselDocumentB.change(async (shape) => {
    shape.payload.num = shape.payload.num + 100;
    shape.partyB = await clientB.context.sign(shape.payload);
    return shape;
  });

  console.log("Same num, sigA...");
  await sleep(20000);
  await vesselDocument.change(async (shape) => {
    shape.partyA = await clientA.context.sign(shape.payload);
    return shape;
  });

  await sleep(10000);

  console.log("sleeping after agreement is set. call should fail...");
  await sleep(20000);
  try {
    await vesselDocument.change(async (shape) => {
      shape.payload = {
        num: shape.payload.num + 100,
      };
      const signed = await clientA.context.sign(shape.payload);
      shape.payload = {
        num: shape.payload.num,
      };
      shape.partyA = signed;
      return shape;
    });
  } catch (e) {
    console.log("Really failed. Cool.");
  }
}

main().finally(() => {
  clientA.close();
  clientB.close();
});
