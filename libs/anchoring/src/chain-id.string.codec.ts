import * as t from 'io-ts';
import { ChainID } from 'caip';
import { Either } from 'fp-ts/lib/Either';

function is(input: unknown): input is ChainID {
  return input instanceof ChainID;
}

function validate(input: string, context: t.Context): Either<t.Errors, ChainID> {
  try {
    return t.success(new ChainID(input));
  } catch (e) {
    return t.failure(input, context, e.message);
  }
}

function encode(chainId: ChainID) {
  return chainId.toString();
}

export const ChainIdStringCodec = new t.Type<ChainID, string, string>('ChainId-String', is, validate, encode);
