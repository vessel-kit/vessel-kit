import { PrivateKeyFactory } from "../../private-key.factory";
import { AlgorithmKind } from "../../algorithm-kind";
import * as jws from "../jws";
import * as keyMethod from "../../key.method";
import { InvalidJWSError } from "../jws";
import { Resolver } from "did-resolver";
import CID from "cids";

const privateKeyFactory = new PrivateKeyFactory();
const privateKey = privateKeyFactory.fromSeed(AlgorithmKind.ES256K, "seed");

describe("createEnveloped", () => {
  test("plain", async () => {
    const payload = { hello: "world" };
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const envelope = await jws.createEnveloped(signer, payload);
    expect(envelope).toMatchSnapshot();
    const signature = await jws.create(signer, payload);
    const detached = jws.asDetached(signature);
    expect(envelope.signature).toEqual(detached);
  });
});

describe("create", () => {
  test("plain", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const signature = await jws.create(signer, { hello: "world" });
    expect(signature).toMatchSnapshot();
  });
  test("with CID", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const signature = await jws.create(signer, {
      hello: new CID(
        "bafyreie2a2sbirpdklnsi6uxlwng5istoztktj7lrsyfqv3wonovazy354"
      ),
    });
    expect(signature).toMatchSnapshot();
  });
  test("with bytes", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const signature = await jws.create(signer, {
      hello: {
        world: new Uint8Array([1, 2, 3]),
      },
    });
    expect(signature).toMatchSnapshot();
  });
});

describe("splitParts", () => {
  test("ok", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const payload = { hello: "world" };
    const signature = await jws.create(signer, payload);
    const decoded = jws.splitParts(signature);
    expect(decoded).toMatchSnapshot();
  });

  test("malformed jws", async () => {
    expect(() => jws.splitParts("malformed jws")).toThrow(
      new InvalidJWSError("Wrong format")
    );
  });
});

describe("decode", () => {
  test("ok", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const payload = { hello: "world" };
    const signature = await jws.create(signer, payload);
    const decoded = jws.decode(signature);
    expect(decoded).toMatchSnapshot();
    expect(decoded.payload).toEqual(payload);
  });

  test("malformed jws", async () => {
    expect(() => jws.decode("malformed jws")).toThrow(
      new InvalidJWSError("Wrong format")
    );
  });

  test("no kid", async () => {
    const noKid = "eyJhbGciOiJub25lIn0.e30.eyJhbGciOiJub25lIn0";
    expect(() => jws.decode(noKid)).toThrow(
      new InvalidJWSError("Missing kid header")
    );
  });

  test("no alg", async () => {
    const noKid = "eyJraWQiOiAiZm9vIn0.e30.eyJhbGciOiJub25lIn0";
    expect(() => jws.decode(noKid)).toThrow(
      new InvalidJWSError("Missing alg header")
    );
  });
});

describe("verify", () => {
  test("ok", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const signature = await jws.create(signer, { hello: "world" });
    const resolver = new Resolver({
      ...keyMethod.getResolver(),
    });
    await expect(jws.verify(signature, resolver)).resolves.toBeTruthy();
  });
  test("with CID", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const signature = await jws.create(signer, {
      hello: new CID(
        "bafyreie2a2sbirpdklnsi6uxlwng5istoztktj7lrsyfqv3wonovazy354"
      ),
    });
    const resolver = new Resolver({
      ...keyMethod.getResolver(),
    });
    await expect(jws.verify(signature, resolver)).resolves.toBeTruthy();
  });
  test("with bytes", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const signature = await jws.create(signer, {
      hello: {
        world: new Uint8Array([1, 2, 3]),
      },
    });
    const resolver = new Resolver({
      ...keyMethod.getResolver(),
    });
    await expect(jws.verify(signature, resolver)).resolves.toBeTruthy();
  });
  test("no document", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const signature = await jws.create(signer, { hello: "world" });
    const resolver = new Resolver();
    await expect(jws.verify(signature, resolver)).rejects.toThrow();
  });
  test("no keys", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const signature = await jws.create(signer, { hello: "world" });
    const resolver = new Resolver({
      key: async () => {
        return {
          id: "did:key:zQ3shawAiwRa3YbMitAcCyT9PhqPgy4Q4o1va8wzVyz9Lneh7",
          "@context": "https://w3id.org/did/v1",
          publicKey: [],
        };
      },
    });
    await expect(jws.verify(signature, resolver)).resolves.toBeFalsy();
  });
});

describe("detached", () => {
  const payload = { hello: "world" };

  test("asDetached", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const signature = await jws.create(signer, { hello: "world" });
    expect(jws.asDetached(signature)).toMatchSnapshot();
  });

  test("asAttached", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const signature = await jws.create(signer, payload);
    const detached = jws.asDetached(signature);
    const attached = jws.asAttached(payload, detached);
    expect(attached).toEqual(signature);
  });

  test("isDetached and isAttached", async () => {
    const signer = await keyMethod.SignerIdentified.fromPrivateKey(privateKey);
    const signature = await jws.create(signer, { hello: "world" });
    const detached = jws.asDetached(signature);
    const attached = jws.asAttached(payload, detached);
    expect(jws.isDetached(detached)).toBeTruthy();
    expect(jws.isDetached(attached)).toBeFalsy();

    expect(jws.isAttached(detached)).toBeFalsy();
    expect(jws.isAttached(attached)).toBeTruthy();
  });
});
