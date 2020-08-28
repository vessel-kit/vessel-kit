import type { IContext } from '../context';
import {
  TwoPartyShape,
  TwoPartyState,
  VesselDocumentShape,
  VesselDocumentState,
} from '../doctypes/vessel-document-alpha-doctype';
import type { AnchoringStatus } from '@potter/anchoring';

async function checkSignature(context: IContext, payload: any) {
  if (payload) {
    try {
      await context.assertSignature(payload);
      return true;
    } catch {
      return false;
    }
  } else {
    return false;
  }
}

const DOCTYPE = 'vessel/document/1.0.0';

function isShape<A>(input: unknown): input is VesselDocumentShape<A> {
  // TODO UNKNOWN
  // TODO Must be specific to ruleset
  return typeof input === 'object' && 'doctype' in input && (input as any).doctype == DOCTYPE;
}

export default class Ruleset {
  constructor(readonly context: IContext) {}

  async canonical(state: VesselDocumentState<TwoPartyState>) {
    return {
      doctype: state.doctype,
      ruleset: state.ruleset,
      content: state.data.current || state.data.freight,
    };
  }

  async knead(genesisRecord: unknown): Promise<VesselDocumentState<TwoPartyState>> {
    if (isShape<TwoPartyShape>(genesisRecord)) {
      return {
        doctype: genesisRecord.doctype,
        ruleset: genesisRecord.ruleset,
        data: {
          current: null,
          freight: {
            ...genesisRecord.content,
            stage: 'draft' as 'draft',
          },
          anchor: {
            status: 'NOT_REQUESTED' as AnchoringStatus.NOT_REQUESTED,
          },
        },
      };
    }
  }

  async canApply(
    current: VesselDocumentState<TwoPartyState>,
    next: TwoPartyShape,
  ): Promise<VesselDocumentState<TwoPartyState>> {
    if (current && next) {
      const currentContent = current.data.current || current.data.freight;
      if (currentContent.stage === 'agreement') {
        throw new Error(`Can not update after agreement is reached`);
      }
      const toCheckA = next.partyA
        ? {
            ...next.payload,
            ...next.partyA,
          }
        : null;
      const toCheckB = next.partyB
        ? {
            ...next.payload,
            ...next.partyB,
          }
        : null;
      const checkA = await checkSignature(this.context, toCheckA);
      const checkB = await checkSignature(this.context, toCheckB);
      if (checkA || checkB) {
        if (currentContent && next) {
          if (currentContent.payload.num <= next.payload.num) {
            const stage = checkA && checkB ? ('agreement' as 'agreement') : ('draft' as 'draft');
            return {
              ...current,
              data: {
                ...current.data,
                current: {
                  ...next,
                  stage: stage,
                },
              },
            };
          } else {
            throw new Error(`Can not decrease`);
          }
        } else {
          throw new Error(`No currentContent && nextContent`);
        }
      } else {
        throw new Error(`Neither signature fits`);
      }
    } else {
      throw new Error(`No current && next`);
    }
  }
}
