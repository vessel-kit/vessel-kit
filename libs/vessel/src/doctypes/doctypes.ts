import { DocumentState } from '../document.state';
import { RecordWrap, CeramicDocumentId, Codec } from '@potter/codec';
import { UpdateRecordWaiting } from '../remote/client';
import jsonPatch from 'fast-json-patch';
import { IContext } from '../context';
import CID from 'cids';
import { FrozenSubject } from '../frozen-subject';

export interface IDocument {
  id: CeramicDocumentId;
  head: CID;
  state: DocumentState;
  current: any;
  state$: FrozenSubject<DocumentState>;
  update(record: any): Promise<void>;
  requestAnchor(): void;
  as<F extends WithDoctype>(doctype: Doctype<F>): TypedDocument<F>;
  close(): void;
  toJSON(): any;
}

export interface WithDoctype {
  doctype: string;
}

export interface Handler<Freight extends WithDoctype> {
  // Return payload as JSON
  makeGenesis(payload: Omit<Freight, 'doctype'>): Promise<any>;
  applyUpdate(updateRecord: RecordWrap, state: DocumentState): Promise<DocumentState>;
}

export class TypedDocument<F extends WithDoctype> {
  #document: IDocument;
  #doctype: Doctype<F>;
  #context: IContext;

  constructor(document: IDocument, doctype: Doctype<F>, context: IContext) {
    this.#document = document;
    this.#doctype = doctype;
    this.#context = context;
  }

  get state(): F {
    return this.#doctype.json.decode(this.#document.current);
  }

  async change(next: F, opts?: { useMgmt: boolean }) {
    const nextJSON = this.#doctype.json.encode(next);
    const currentJSON = this.#doctype.json.encode(this.state);
    const patch = jsonPatch.compare(nextJSON, currentJSON);
    const payloadToSign = UpdateRecordWaiting.encode({
      patch: patch,
      prev: this.#document.state.log.last,
      id: this.#document.id,
    });
    const signedUpdateRecord = await this.#context.sign(payloadToSign, opts);
    await this.#document.update(signedUpdateRecord);
  }
}

export interface Doctype<Freight extends WithDoctype> extends Handler<Freight> {
  _doctype: true;
  name: string;
  json: Codec<Freight>;
}

export function doctype<Freight extends WithDoctype>(
  name: string,
  json: Codec<Freight>,
  handler: Handler<Freight>,
): Doctype<Freight> {
  return {
    _doctype: true,
    name: name,
    json: json,
    ...handler,
  };
}
