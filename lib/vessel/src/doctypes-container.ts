import { IDoctype } from "./document/doctype";
import { IContext } from "./context";

export class UnknownDoctypeError extends Error {
  constructor(doctype: string) {
    super(`Can not handle doctype "${doctype}"`);
  }
}

export class DoctypesContainer {
  #container: Map<string, IDoctype<unknown, unknown>> = new Map();

  constructor(doctypes: IDoctype<unknown, unknown>[] = [], context?: IContext) {
    doctypes.forEach((d) => {
      const contextful = context ? d.withContext(context) : d;
      this.#container.set(d.name, contextful);
    });
  }

  add<State, Shape>(doctype: IDoctype<State, Shape>): void {
    this.#container.set(doctype.name, doctype);
  }

  get(name: string): IDoctype<unknown, unknown> {
    const handler = this.#container.get(name);
    if (handler) {
      return handler;
    } else {
      throw new UnknownDoctypeError(name);
    }
  }
}
