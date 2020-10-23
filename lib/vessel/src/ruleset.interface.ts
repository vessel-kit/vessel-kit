import type {
  VesselDocumentShape,
  VesselDocumentState,
} from "./doctypes/vessel-document-alpha-doctype";
import type { AnchorProof } from "@vessel-kit/anchoring";
import type { DocId, RecordWrap } from "@vessel-kit/codec";

export interface IRuleset<State, Shape> {
  canonical(
    state: VesselDocumentState<State>
  ): Promise<VesselDocumentShape<Shape>>;
  knead(genesisRecord: unknown): Promise<VesselDocumentState<State>>;
  applyAnchor(proof: AnchorProof, state: State): Promise<State>;
  canApply(
    docId: DocId,
    current: VesselDocumentState<State>,
    recordWrap: RecordWrap
  ): Promise<VesselDocumentState<State>>;
}
