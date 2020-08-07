import { EMPTY_CONTEXT, IContext } from '../context';
import { CeramicDocumentId, RecordWrap } from '@potter/codec';
import { Ordering } from './ordering';

abstract class GenericHandler {
  abstract readonly name: string;
  constructor(readonly context: IContext = EMPTY_CONTEXT) {}
  withContext(context: IContext): this {
    return Reflect.construct(this.constructor, [context]);
  }
}

export interface IDoctype<State, Shape> {
  name: string;
  context: IContext;
  withContext(context: IContext): this;

  canonical(state: State): Promise<Shape>;
  knead(genesisRecord: unknown): Promise<State>;
  order(a: State, b: State): Promise<Ordering>;
  apply(recordWrap: RecordWrap, state: State, docId: CeramicDocumentId): Promise<State>;
}

export abstract class DoctypeHandler<State, Shape> extends GenericHandler implements IDoctype<State, Shape> {
  abstract knead(genesisRecord: unknown): Promise<State>;
  abstract canonical(state: State): Promise<Shape>;
  abstract order(a: State, b: State): Promise<Ordering>;
  abstract apply(recordWrap: RecordWrap, state: State, docId: CeramicDocumentId): Promise<State>;
}
