import { IHandler } from './handler.interface';

export class UnknownHandlerDoctypeError extends Error {
  constructor(doctype: string) {
    super(`Can not find handler for doctype "${doctype}"`);
  }
}

export class HandlersContainer {
  #container: Map<string, IHandler>

  constructor(container: Map<string, IHandler> = new Map()) {
    this.#container = container
  }

  set(doctype: string, handler: IHandler): void {
    this.#container.set(doctype, handler)
  }

  get(doctype: string): IHandler {
    const handler = this.#container.get(doctype);
    if (handler) {
      return handler;
    } else {
      throw new UnknownHandlerDoctypeError(doctype);
    }
  }
}
