import { IHandler } from './handler.interface';
import { DocumentState } from '../document/document.state';
import { decodePromise } from '@potter/codec';
import { VesselRuleset } from './vessel-freight';
import produce from 'immer';
import { AnchoringStatus } from '@potter/anchoring';

export class VesselAlphaRulesetHandler implements IHandler {
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
    throw new Error(`Not implemented: VesselAlphaHandler.applyUpdate`);
  }

  async makeGenesis(content: any): Promise<any> {
    await decodePromise(VesselRuleset, content);
    return content;
  }
}
