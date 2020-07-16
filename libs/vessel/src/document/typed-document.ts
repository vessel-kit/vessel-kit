import { IWithDoctype } from './with-doctype.interface';
import { IDocument } from './document.interface';
import { IContext } from '../context';
import jsonPatch from 'fast-json-patch';
import { UpdateRecordWaiting } from '../remote/client';
import { ITypedDocument } from './typed-document.interface';
import { IDoctype } from './doctype';

export class TypedDocument<F extends IWithDoctype> implements ITypedDocument<F> {
  #document: IDocument;
  #doctype: IDoctype<F>;
  #context: IContext;

  constructor(document: IDocument, doctype: IDoctype<F>, context: IContext) {
    this.#document = document;
    this.#doctype = doctype;
    this.#context = context;
  }

  get freight(): F {
    return this.#doctype.json.decode(this.#document.current);
  }

  async update(next: F, opts?: { useMgmt: boolean }) {
    const nextJSON = this.#doctype.json.encode(next);
    const currentJSON = this.#doctype.json.encode(this.freight);
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
