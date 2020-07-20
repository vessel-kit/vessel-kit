import { IDoctype } from './document/doctype';
import { IContext } from './context';

export class UnknownDoctypeError extends Error {
  constructor(doctype: string) {
    super(`Can not handle doctype "${doctype}"`);
  }
}

export class DoctypesContainer {
  #container: Map<string, IDoctype> = new Map();

  constructor(doctypes: IDoctype[] = [], context?: IContext) {
    doctypes.forEach((d) => {
      const contextful = context ? d.withContext(context) : d;
      this.#container.set(d.name, contextful);
    });
  }

  add(doctype: IDoctype): void {
    this.#container.set(doctype.name, doctype);
  }

  get(name: string): IDoctype {
    const handler = this.#container.get(name);
    if (handler) {
      return handler;
    } else {
      throw new UnknownDoctypeError(name);
    }
  }
}
