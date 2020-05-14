import { Doctype } from './doctype';
import { IHandler } from './handlers/handler.interface';

export class UnknownHandlerDoctypeError extends Error {
  constructor(doctype: Doctype) {
    super(`Can not find handler for doctype "${doctype}"`);
  }
}

export class HandlerContainer {
  constructor(private readonly handlers: Map<Doctype, IHandler> = new Map()) {}

  set(doctype: Doctype, handler: IHandler) {
    this.handlers.set(doctype, handler);
    return new HandlerContainer(this.handlers);
  }

  get(doctype: Doctype) {
    const handler = this.handlers.get(doctype);
    if (handler) {
      return handler;
    } else {
      throw new UnknownHandlerDoctypeError(doctype);
    }
  }
}
