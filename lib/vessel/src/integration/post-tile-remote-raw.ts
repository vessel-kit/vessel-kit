import { sleep } from "./sleep.util";
import axios from "axios";
import CID from "cids";
import { History } from "../util/history";
import jsonPatch from "fast-json-patch";
import { decodeThrow } from "@vessel-kit/codec";
import { SnapshotCodec } from "..";
import * as t from "io-ts";
import {
  AlgorithmKind,
  KeyIdentity,
  PrivateKeyFactory,
  jws,
} from "@vessel-kit/identity";

const REMOTE_URL = "http://localhost:3001";

const privateKeyFactory = new PrivateKeyFactory();

async function createUser(seed: string) {
  const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, seed);
  return new KeyIdentity(privateKey);
}

async function main() {
  const user = await createUser(
    "0xf533035c3339782eb95ffdfb7f485ac2c74545033a7cb2a46b6c91f77ae33b8f"
  );
  const tile = {
    doctype: "tile" as "tile",
    owners: [await user.did().then((i) => i.toString())],
    content: {},
  };
  console.log("to sign", tile);
  const jwt = await user.sign(tile);
  const detached = jws.asDetached(jwt);
  const signedTile = {
    ...tile,
    signature: detached,
  };
  console.log("posting", signedTile);
  const genesisResponse = await axios.post(
    `${REMOTE_URL}/api/v0/document`,
    signedTile
  );
  console.log("genesis response", genesisResponse.data);
  const snapshot = decodeThrow(SnapshotCodec(t.unknown), genesisResponse.data);
  const documentId = snapshot.log.first;
  await sleep(61000);
  const anchoredGenesisResponse = await axios.get(
    `${REMOTE_URL}/api/v0/document/${documentId.toString()}`
  );
  const log = new History(
    anchoredGenesisResponse.data.log.map((cid: string) => new CID(cid))
  );
  const doc2 = Object.assign({}, tile);
  doc2.content = {
    foo: "33",
  };
  const delta = jsonPatch.compare(tile, doc2);
  console.log(delta);
  const updateRecord = {
    patch: delta,
    prev: log.last,
    id: documentId,
  };
  const updateRecordToSign = {
    patch: updateRecord.patch,
    prev: { "/": updateRecord.prev.valueOf().toString() },
    id: { "/": updateRecord.id.valueOf().toString() },
  };
  const jwtUpdate = await user.sign(updateRecordToSign);
  const updateRecordA = {
    ...updateRecordToSign,
    signature: jws.asDetached(jwtUpdate),
  };
  console.log("signed payload", updateRecordToSign);
  const updateResponse = await axios.put(
    `${REMOTE_URL}/api/v0/document/${documentId.toString()}`,
    updateRecordA
  );
  console.log("update response", updateResponse.data);
}

main();
