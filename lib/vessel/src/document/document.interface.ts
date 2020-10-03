import { FrozenSubject } from "../util/frozen-subject";
import { DocId } from "@vessel-kit/codec";
import { History, HistoryCodec } from "../util/history";
import * as t from "io-ts";
import { IContext } from "../context";

export interface Snapshot<A> {
  doctype: string;
  view: A;
  log: History;
}

export function SnapshotCodec<A>(codec: t.Type<A, unknown, any>) {
  return t.type({
    doctype: t.string,
    view: codec,
    log: HistoryCodec,
  });
}

export interface IDocument<State, Shape> {
  id: DocId;
  log: History;
  state: Snapshot<State>;
  state$: FrozenSubject<Snapshot<State>>;
  view: State;
  context: IContext;
  update(record: any): Promise<void>;
  requestAnchor(): void;
  close(): void;
  toJSON(): any;
  canonical(): Promise<Shape>;
}
