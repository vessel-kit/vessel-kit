import * as t from 'io-ts';
import CID from 'cids';

const format = new RegExp(/^did:3:(\w+)$/i);

export interface ThreeIdentifierBrand {
  readonly ThreeIdentifier: unique symbol;
}

export const ThreeIdentifier = t.brand(
  t.string,
  (s: string): s is t.Branded<string, ThreeIdentifierBrand> => {
    const match = format.exec(s);
    return Boolean(match && match[1] && CID.validateCID(match[1]));
  },
  'ThreeIdentifier',
);

export type ThreeIdentifier = t.TypeOf<typeof ThreeIdentifier>;
