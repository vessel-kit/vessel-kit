import * as t from 'io-ts';

export enum PathDirection {
  L = 'L',
  R = 'R',
}

export const PathDirectionCodec = t.union([t.literal(PathDirection.L), t.literal(PathDirection.R)]);
