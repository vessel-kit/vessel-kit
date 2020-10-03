import { InvalidSignatureError } from "./invalid-signature.error";
import _ from "lodash";
import { jws, IResolver } from "@vessel-kit/identity";

// TODO Check signor
export async function assertSignature(
  record: any,
  resolvable: IResolver
): Promise<void> {
  const payloadObject = _.omit(record, ["signature"]);
  payloadObject.prev = payloadObject.prev
    ? { "/": payloadObject.prev.toString() }
    : undefined;
  payloadObject.id = payloadObject.id
    ? { "/": payloadObject.id.toString() }
    : undefined;

  const attached = jws.asAttached(payloadObject, record.signature);
  const isCorrect = await jws.verify(attached, resolvable);
  if (!isCorrect) {
    throw new InvalidSignatureError(`Invalid signature`);
  }
}
