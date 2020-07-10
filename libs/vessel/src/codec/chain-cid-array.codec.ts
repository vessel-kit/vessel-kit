import * as t from 'io-ts';
import { Chain } from '../chain';
import CID from 'cids';

export const ChainCidArrayCodec = new t.Type<Chain, CID[], CID[]>(
  'Chain-CIDArray',
  (input: unknown): input is Chain => input instanceof Chain,
  input => {
    return t.success(new Chain(input));
  },
  (a: Chain) => a.log,
);
