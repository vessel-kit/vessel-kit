import { IWithDoctype } from './with-doctype.interface';
import { IHandler } from './handler.interface';
import { Codec } from '@potter/codec';

export interface IDoctype<Freight extends IWithDoctype> extends IHandler<Freight> {
  _doctype: true;
  name: string;
  json: Codec<Freight>;
}
