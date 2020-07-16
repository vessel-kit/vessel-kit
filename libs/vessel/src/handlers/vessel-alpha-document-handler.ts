import { IHandler } from './handler.interface';
import { DocumentState } from '../document/document.state';
import { VesselDocument } from './vessel-freight';
import { decodePromise } from '@potter/codec';
import produce from 'immer';
import { AnchoringStatus } from '@potter/anchoring';
import { Cloud } from '../cloud/cloud';
import CID from 'cids';
import 'ses';
import jsonPatch from 'fast-json-patch';

export class VesselAlphaDocumentHandler implements IHandler {
  constructor(private readonly cloud: Cloud) {}

  async applyAnchor(anchorRecord, proof, state: DocumentState): Promise<DocumentState> {
    return produce(state, async (next) => {
      next.log = next.log.concat(anchorRecord.cid);
      if (next.current) {
        next.freight = next.current;
        next.current = null;
      }
      next.anchor = {
        status: AnchoringStatus.ANCHORED,
        proof: {
          chainId: proof.chainId.toString(),
          blockNumber: proof.blockNumber,
          timestamp: new Date(proof.blockTimestamp * 1000),
          txHash: proof.txHash,
          root: proof.root,
        },
      };
    });
  }

  async applyGenesis(genesis: any): Promise<any> {
    return genesis;
  }

  async applyUpdate(updateRecord, state: DocumentState) {
    const s = state.current || state.freight;
    const governance = s.governance;
    if (governance && typeof governance == 'string') {
      const governanceCID = new CID(governance);
      const governanceDoc = await this.cloud.retrieve(governanceCID);
      // lockdown();
      const compartment = new Compartment({
        module: {},
      });
      const main = compartment.evaluate(governanceDoc.content.main);
      // const main = eval(governanceDoc.main)
      const canApply = main.canApply;
      const next = jsonPatch.applyPatch(s, updateRecord.load.patch, false, false).newDocument;
      const canApplyResult = canApply(s, next);
      if (canApplyResult) {
        return {
          ...state,
          current: next.newDocument,
          log: state.log.concat(updateRecord.cid),
          anchor: {
            status: AnchoringStatus.NOT_REQUESTED,
          },
        };
      } else {
        throw new Error(`Must not apply update`);
      }
    } else {
      throw new Error(`No governance found`);
    }
  }

  async makeGenesis(content: any): Promise<any> {
    await decodePromise(VesselDocument, content);
    return content;
  }
}
