import type { IContext } from '../context';
import { VesselDocumentShape, VesselDocumentState } from '../doctypes/vessel-document-alpha-doctype';

export default class Ruleset {
  constructor(readonly context: IContext) {}

  canApply(current: VesselDocumentState, next: VesselDocumentShape) {
    if (current && next) {
      const currentContent = current.current || current.freight;
      if (currentContent && next) {
        return currentContent.content.num < next.content.num;
      } else {
        throw new Error(`No currentContent && nextContent`)
      }
    } else {
      throw new Error(`No current && next`)
    }
  }
}
