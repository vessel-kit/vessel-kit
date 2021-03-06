import { sleep } from "./sleep.util";
import { Client } from "../remote/client";
import { Tile } from "../doctypes/tile/tile";
import {
  AlgorithmKind,
  KeyIdentity,
  PrivateKeyFactory,
} from "@vessel-kit/identity";

const REMOTE_URL = "http://localhost:3001";
const client = new Client(REMOTE_URL);

const privateKey = new PrivateKeyFactory().fromSeed(
  AlgorithmKind.ES256K,
  "seed"
);
const identity = new KeyIdentity(privateKey);

async function main() {
  await client.addSignor(identity);
  const did = await identity.did();
  const tile = await Tile.create(client.create, client.context, {
    owners: [did.toString()],
    content: {},
  });
  tile.document.state$.subscribe((state) => {
    console.log(new Date().toLocaleTimeString(), state);
  });
  await sleep(65000);
  await tile.change((shape) => {
    return {
      ...shape,
      content: {
        foo: 33,
      },
    };
  });
  await sleep(65000);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
