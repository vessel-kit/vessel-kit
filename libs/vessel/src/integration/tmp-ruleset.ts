import type { IContext } from '../context';
import { VesselDocumentShape, VesselDocumentState } from '../doctypes/vessel-document-alpha-doctype';

async function checkSignature(context: IContext, payload: any) {
  if (payload) {
    try {
      await context.assertSignature(payload)
      return true
    } catch {
      return false
    }
  } else {
    return false
  }
}

export default class Ruleset {
  constructor(readonly context: IContext) {}

  async canApply(current: VesselDocumentState, next: VesselDocumentShape): Promise<boolean> {
    if (current && next) {
      const toCheckA = next.content.partyA ? {
        ...next.content.payload,
        ...next.content.partyA
      } : null
      const toCheckB = next.content.partyB ? {
        ...next.content.payload,
        ...next.content.partyB
      } : null
      const checkA = await checkSignature(this.context, toCheckA)
      const checkB = await checkSignature(this.context, toCheckB)
      console.log('check', checkA, checkB)
      if (checkA || checkB) {
        const currentContent = current.current || current.freight;
        if (currentContent && next) {
          return currentContent.content.payload.num < next.content.payload.num;
        } else {
          throw new Error(`No currentContent && nextContent`)
        }
      } else {
        throw new Error(`Neither signature fits`)
      }
    } else {
      throw new Error(`No current && next`)
    }
  }
}
