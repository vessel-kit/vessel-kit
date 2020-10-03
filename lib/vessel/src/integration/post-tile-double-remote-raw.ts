import { sleep } from "./sleep.util";
import axios from "axios";
import jsonPatch from "fast-json-patch";
import { decodeThrow } from "@vessel-kit/codec";
import { SnapshotCodec } from "..";
import * as t from "io-ts";
import {
  AlgorithmKind,
  KeyIdentity,
  PrivateKeyFactory,
} from "@vessel-kit/identity";

const REMOTE_URL = "http://localhost:3001";

const privateKeyFactory = new PrivateKeyFactory();

async function createUser(seed: string) {
  const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, seed);
  return new KeyIdentity(privateKey);
}

async function main() {
  const userA = await createUser(
    "0x1110000000000000000000000000000000000000000000000000000000000000"
  );
  const userB = await createUser(
    "0x2220000000000000000000000000000000000000000000000000000000000000"
  );
  const tile = {
    doctype: "tile" as "tile",
    owners: [
      await userA.did().then((i) => i.toString()),
      await userB.did().then((i) => i.toString()),
    ],
    content: {},
  };
  const signature = await userA.sign(tile);
  const signedTile = {
    ...tile,
    signature: signature,
  };
  const genesisResponse = await axios.post(
    `${REMOTE_URL}/api/v0/document`,
    signedTile
  );
  const snapshot = decodeThrow(SnapshotCodec(t.unknown), genesisResponse.data);
  console.log("genesis response", genesisResponse.data);
  const documentId = snapshot.log.first;
  await sleep(65000);
  const anchoredGenesisResponse = await axios.get(
    `${REMOTE_URL}/api/v0/document/${documentId.toString()}`
  );
  const anchoredSnapshot = decodeThrow(
    SnapshotCodec(t.unknown),
    anchoredGenesisResponse.data
  );
  const log = anchoredSnapshot.log;
  const doc2 = Object.assign({}, tile);
  doc2.content = {
    foo: "33",
  };
  const delta = jsonPatch.compare(tile, doc2);
  console.log(delta);
  const updateRecordToSign = {
    patch: delta,
    prev: { "/": log.last.toString() },
    id: { "/": documentId.valueOf().toString() },
  };
  console.log("signing payload", updateRecordToSign);
  const updateSignature = await userB.sign(updateRecordToSign);
  const updateRecordA = {
    ...updateRecordToSign,
    signature: updateSignature,
  };
  const updateResponse = await axios.put(
    `${REMOTE_URL}/api/v0/document/${documentId.toString()}`,
    updateRecordA
  );
  console.log("update response", updateResponse.data);
}

main();
