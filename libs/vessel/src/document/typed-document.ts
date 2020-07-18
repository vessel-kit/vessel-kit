import { IWithDoctype } from './with-doctype.interface';
import { IDocument } from './document.interface';
import { IContext } from '../context';
import jsonPatch from 'fast-json-patch';
import { ITypedDocument } from './typed-document.interface';
import { IDoctype, withContext } from './doctype';
import { UpdateRecordWaiting } from '../util/update-record.codec';

export class TypedDocument<F extends IWithDoctype> implements ITypedDocument<F> {
  #document: IDocument;
  #doctype: IDoctype<F>;

  constructor(document: IDocument, doctype: IDoctype<F>) {
    this.#document = document;
    this.#doctype = doctype;
  }

  get current(): F {
    return this.#doctype.json.decode(this.#document.current);
  }

  get document(): IDocument {
    return this.#document;
  }

  async update(next: F) {
    if (this.#doctype.update) {
      const signedUpdateRecord = await this.#doctype.update(this.#document, next);
      await this.#document.update(signedUpdateRecord);
    } else {
      const nextJSON = this.#doctype.json.encode(next);
      const currentJSON = this.#doctype.json.encode(this.current);
      const patch = jsonPatch.compare(nextJSON, currentJSON);
      const payloadToSign = UpdateRecordWaiting.encode({
        patch: patch,
        prev: this.#document.state.log.last,
        id: this.#document.id,
      });
      const signedUpdateRecord = await this.#doctype.context.sign(payloadToSign);
      await this.#document.update(signedUpdateRecord);
    }
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.toJSON();
  }

  toJSON() {
    return this.#document.toJSON();
  }
}
