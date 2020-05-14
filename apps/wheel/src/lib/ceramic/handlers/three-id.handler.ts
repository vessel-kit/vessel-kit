import CID from 'cids';
import { Doctype } from '../doctype';
import { IHandler } from './handler.interface';
import { DocumentState } from '../document.state';
import jsonPatch from 'fast-json-patch'

export class ThreeIdHandler implements IHandler {
  static DOCTYPE = Doctype.THREE_ID

  async makeGenesis(record: any) {
    return record
  }

  async applyGenesis(record: any, cid: CID) {
    // TODO - verify genesis record
    return {
      doctype: ThreeIdHandler.DOCTYPE,
      owners: record.owners,
      content: record.content,
      nextContent: null,
      log: [cid]
    }
  }

  async makeRecord(state: DocumentState, next: any): Promise<any> {
    const patch = jsonPatch.compare(state.body.content, next)
    const record = { content: patch, prev: state.log[state.log.length - 1] }
    // Sign or add signature
    return record
  }

  async applySigned(record: any, cid: CID, state: DocumentState): Promise<DocumentState> {
    // Add signature
    state.log.push(record)
    return {
      ...state
    }
    // return {
    //   ...state,
    //   signature: SignatureStatus.SIGNED,
    //   anchorStatus: AnchorStatus.NOT_REQUESTED,
    //   nextContent: jsonpatch.applyPatch(state.content, record.content).newDocument
    // }
  }
}
