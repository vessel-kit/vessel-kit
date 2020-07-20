import * as t from 'io-ts';
import CID from 'cids';
import { CidStringCodec } from '@potter/codec';
import { isRight } from 'fp-ts/lib/Either';

const format = new RegExp(/^did:3:(\w+)$/i);

export interface ThreeIdentifierBrand {
  readonly ThreeIdentifier: unique symbol;
}

export const ThreeIdentifier = t.brand(
  t.string,
  (s: string): s is t.Branded<string, ThreeIdentifierBrand> => {
    const match = format.exec(s);
    return Boolean(match && match[1] && isRight(CidStringCodec.validate(match[1], [])));
  },
  'ThreeIdentifier',
);

export const ThreeIdentifierCidCodec = new t.Type<ThreeIdentifier, CID, CID>(
  'ThreeIdentifier-CID',
  ThreeIdentifier.is,
  (cid, context) => {
    return ThreeIdentifier.validate(`did:3:${cid.toString()}`, context);
  },
  (a) => {
    const match = format.exec(a);
    return new CID(match[1]);
  },
);

export type ThreeIdentifier = t.TypeOf<typeof ThreeIdentifier>;
