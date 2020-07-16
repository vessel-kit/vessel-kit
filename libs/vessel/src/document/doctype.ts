import { Codec } from '@potter/codec';
import { IWithDoctype } from './with-doctype.interface';
import { IHandler } from './handler.interface';

export interface IDoctype<Freight extends IWithDoctype> extends IHandler<Freight> {
  _doctype: true;
  name: string;
  json: Codec<Freight>;
}

export function doctype<Freight extends IWithDoctype>(
  name: string,
  json: Codec<Freight>,
  handler: IHandler<Freight>,
): IDoctype<Freight> {
  return {
    _doctype: true,
    name: name,
    json: json,
    ...handler,
  };
}
