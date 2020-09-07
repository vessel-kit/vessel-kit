import { PathDirection } from './path-direction';
import { enumOf } from '@vessel-kit/codec';

export const PathDirectionStringCodec = enumOf(PathDirection, 'PathDirection-string');
