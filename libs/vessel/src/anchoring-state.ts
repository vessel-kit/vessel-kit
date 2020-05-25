export enum AnchoringStateKind {
  NOT_REQUESTED = 'NOT_REQUESTED',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface AnchoringNotRequested {
  kind: AnchoringStateKind.NOT_REQUESTED;
}

export interface AnchoringProcessing<State, Pointer> {
  kind:
    | AnchoringStateKind.PENDING
    | AnchoringStateKind.PROCESSING
    | AnchoringStateKind.FAILED
    | AnchoringStateKind.COMPLETED;
  state: State;
  pointer: Pointer;
  anchoringHost: string;
}

export type AnchoringState<State, Pointer> = AnchoringNotRequested | AnchoringProcessing<State, Pointer>;
