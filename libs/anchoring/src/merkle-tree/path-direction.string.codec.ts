import { PathDirection } from './path-direction';
import { enumOf } from '@potter/codec';

export const PathDirectionStringCodec = enumOf(PathDirection, 'PathDirection-String');
