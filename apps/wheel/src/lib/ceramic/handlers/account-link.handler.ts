import CID from 'cids'
import { Doctype } from '../doctype'
import { DocumentState } from '../document.state'
import { IHandler } from './handler.interface'

export class AccountLinkHandler implements IHandler {
  static DOCTYPE = Doctype.ACCOUNT_LINK

  async makeGenesis (record: any): Promise<any> {
    if (!record.owners) throw new Error('Owner must be specified')
    if (record.owners.length !== 1) throw new Error('Exactly one owner must be specified')
    return {
      ...record,
      doctype: 'account-link'
    }
  }

  async applyGenesis (record: any, cid: CID): Promise<DocumentState> {
    // TODO - verify genesis record
    return {
      doctype: AccountLinkHandler.DOCTYPE,
      owners: record.owners,
      content: record.content,
      nextContent: null,
      log: [cid]
    }
  }

  async makeRecord (state: DocumentState, proof: any): Promise<any> {
    const record = { content: proof, prev: state.log[state.log.length - 1] }
    return record
  }

  async applySigned (record: any, cid: CID, state: DocumentState): Promise<DocumentState> {
    state.log.push(cid)
    return {
      ...state
    }
  }
}
