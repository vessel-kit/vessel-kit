import type { IContext } from '../context';
import { VesselDocumentShape, VesselDocumentState } from '../doctypes/vessel-document-alpha-doctype';

export default class Ruleset {
  constructor(readonly context: IContext) {}

  async canApply(current: VesselDocumentState, next: VesselDocumentShape): Promise<boolean> {
    if (current && next) {
      const toCheck = {
        ...next.content.payload,
        ...next.content.party
      }
      await this.context.assertSignature(toCheck)
      const currentContent = current.current || current.freight;
      if (currentContent && next) {
        return currentContent.content.payload.num < next.content.payload.num;
      } else {
        throw new Error(`No currentContent && nextContent`)
      }
    } else {
      throw new Error(`No current && next`)
    }
  }
}
