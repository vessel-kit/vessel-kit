import { EMPTY_CONTEXT, IContext } from '../context';
import { CeramicDocumentId, RecordWrap } from '@potter/codec';
import { AnchorProof } from '@potter/anchoring';

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
  applyAnchor(anchorRecord: RecordWrap, proof: AnchorProof, state: State): Promise<State>;
  applyUpdate(updateRecord: RecordWrap, state: State, docId: CeramicDocumentId): Promise<State>;
}

export abstract class DoctypeHandler<State, Shape> extends GenericHandler implements IDoctype<State, Shape> {
  abstract knead(genesisRecord: unknown): Promise<State>;
  abstract canonical(state: State): Promise<Shape>;
  abstract order(a: State, b: State): Promise<Ordering>;
  abstract applyAnchor(anchorRecord: RecordWrap, proof: AnchorProof, state: State): Promise<State>;
  abstract applyUpdate(updateRecord: RecordWrap, state: State, docId: CeramicDocumentId): Promise<State>;
  //
  // async update(document: IDocument<State>, next: Freight) {
  //   const nextJSON = this.json.encode(next);
  //   const currentJSON = document.current;
  //   const patch = jsonPatch.compare(currentJSON, nextJSON);
  //   const payloadToSign = UpdateRecordWaiting.encode({
  //     patch: patch,
  //     prev: document.log.last,
  //     id: document.id,
  //   });
  //   return this.context.sign(payloadToSign);
  // }
}

export enum Ordering {
  LT = -1,
  GT = 1,
}
