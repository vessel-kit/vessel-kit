import { IWithDoctype } from './with-doctype.interface';
import { IDocument } from './document.interface';
import { ITypedDocument } from './typed-document.interface';
import { IDoctype } from './doctype';

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
    const payload = await this.#doctype.update(this.#document, next);
    await this.#document.update(payload);
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.toJSON();
  }

  toJSON() {
    return this.#document.toJSON();
  }
}
