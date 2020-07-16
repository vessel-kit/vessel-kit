import { IDoctype } from './document/doctype';

export class UnknownDoctypeError extends Error {
  constructor(doctype: string) {
    super(`Can not handle doctype "${doctype}"`);
  }
}

export class DoctypesContainer {
  #container: Map<string, IDoctype> = new Map();

  constructor(doctypes: IDoctype[] = []) {
    doctypes.forEach((d) => {
      this.#container.set(d.name, d);
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
