import { either } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { PathDirectionStringCodec } from './path-direction.string.codec';
import { MerklePath } from './merkle-path';
import { splitString } from '@vessel-kit/codec';

const PathDirectionArrayStringCodec = t.string.pipe(
  splitString('/', PathDirectionStringCodec),
  'PathDirectionArray-String',
);

export const MerklePathStringCodec = new t.Type<MerklePath, string>(
  'MerklePath-String',
  (a: unknown): a is MerklePath => a instanceof MerklePath,
  (input, context) =>
    either.chain(PathDirectionArrayStringCodec.validate(input, context), paths => {
      return t.success(new MerklePath(paths));
    }),
  merklePath => PathDirectionArrayStringCodec.encode(merklePath.steps),
);
