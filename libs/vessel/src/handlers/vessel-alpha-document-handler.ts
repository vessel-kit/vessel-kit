import { IHandler } from './handler.interface';
import { DocumentState } from '../document.state';

export class VesselAlphaDocumentHandler implements IHandler {
  async applyAnchor(anchorRecord, proof, state: DocumentState): Promise<DocumentState> {
    throw new Error(`Not implemented: VesselAlphaDocumentHandler.applyAnchor`)
  }

  async applyGenesis(genesis: any): Promise<any> {
    throw new Error(`Not implemented: VesselAlphaDocumentHandler.applyGenesis`)
  }

  async applyUpdate(updateRecord, state: DocumentState) {
    throw new Error(`Not implemented: VesselAlphaHandler.applyUpdate`);
  }

  async makeGenesis(content: any): Promise<any> {
    throw new Error(`Not implemented: VesselAlphaDocumentHandler.makeGenesis`)
  }
}
