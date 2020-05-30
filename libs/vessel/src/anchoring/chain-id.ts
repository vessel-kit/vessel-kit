import * as t from 'io-ts';
import { UnreachableCaseError } from '../unreachable-case.error';

const ChainIdRegexp = new RegExp(/^(\w+):(\w+)/);

export enum CHAIN_NAMESPACE {
  ETHEREUM = 'eip155',
}

const ChainIdCodec = new t.Type<ChainId, string, string>(
  'ChainId',
  (u: unknown): u is ChainId => u instanceof ChainId,
  (input, context) => {
    const match = input.match(ChainIdRegexp);
    if (match && match[1] && match[2]) {
      const maybeNamespace = match[1] as CHAIN_NAMESPACE;
      switch (maybeNamespace) {
        case CHAIN_NAMESPACE.ETHEREUM:
          return t.success(new ChainId(maybeNamespace, match[2]));
        default:
          throw new UnreachableCaseError(maybeNamespace);
      }
    } else {
      return t.failure(input, context, 'Is invalid chain id');
    }
  },
  (a: ChainId) => `${a.namespace}:${a.reference}`,
);

export class ChainId {
  static codec = ChainIdCodec;
  constructor(readonly namespace: CHAIN_NAMESPACE, readonly reference: string) {}
}
