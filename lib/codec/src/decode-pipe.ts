import * as t from "io-ts";
import { decodeThrow } from "./decode-throw";

export class DecodePipe<A, O> {
  constructor(readonly codec: t.Type<A, O>) {}

  async transform(value: unknown): Promise<A> {
    return decodeThrow(this.codec, value);
  }
}
