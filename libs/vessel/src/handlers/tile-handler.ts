import { IHandler } from './handler.interface';
import { DocumentState } from '../document.state';
import { NotImplementedError } from '../not-implemented.error';
import { TileContent } from '../tile.content';
import { validatePromise } from '@potter/codec';
import produce from 'immer';
import { AnchoringStatus } from '@potter/anchoring';

export class TileHandler implements IHandler {
  applyAnchor(anchorRecord, proof, state: DocumentState): Promise<DocumentState> {
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

  applyGenesis(genesis: any): Promise<any> {
    return genesis;
  }

  applyUpdate(updateRecord, state: DocumentState) {
    throw new NotImplementedError(`TileHandler.applyUpdate`);
  }

  async makeGenesis(content: any): Promise<any> {
    await validatePromise(TileContent, content);
    return content;
  }
}
