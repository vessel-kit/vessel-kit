export enum ChainEventKind {
  DID_TIP_CHANGED = 'DID_TIP_CHANGED',
  DID_APPEND = 'DID_APPEND',
}

export class DidTipChanged<Pointer> {
  readonly kind = ChainEventKind.DID_TIP_CHANGED;
  constructor(readonly previous: Pointer, readonly current: Pointer) {}
}

export class DidAppend<Pointer> {
  readonly kind = ChainEventKind.DID_APPEND;
  constructor(readonly pointer: Pointer) {}
}

export type ChainEvent<Pointer> = DidTipChanged<Pointer> | DidAppend<Pointer>;
