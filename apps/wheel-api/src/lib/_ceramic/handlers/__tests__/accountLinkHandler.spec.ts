import { AccountLinkHandler } from '../account-link.handler'
import CID from 'cids'

jest.mock('3id-blockchain-utils', () => ({
  validateLink: jest.fn()
}))

import { validateLink } from '3id-blockchain-utils'

const FAKE_CID_1 = new CID('bafybeig6xv5nwphfmvcnektpnojts33jqcuam7bmye2pb54adnrtccjlsu')
const FAKE_CID_2 = new CID('bafybeig6xv5nwphfmvcnektpnojts44jqcuam7bmye2pb54adnrtccjlsu')
const RECORDS = {
  genesis: { doctype: 'account-link', owners: [ '0x25954ef14cebbc9af3d71132489a9cfe87043f20@eip155:1' ], content: "did:3:bafyreiecedg6ipyvwdwycdjiakhj5hiuuutxlvywtkvckwvsnu6pjbwxae" }
}

describe('AccountLinkHandler', () => {
  let handler

  beforeEach(() => {
    handler = new AccountLinkHandler()
    validateLink.mockImplementation(async (proof: object): Promise<object> => proof)
  })

  it('makes genesis record correctly', async () => {
    const record = await handler.makeGenesis(RECORDS.genesis)

    expect(record).toEqual(RECORDS.genesis)
  })

  it('throws an error if genesis record has no owners specified', async () => {
    await expect(handler.makeGenesis({ doctype: 'account-link', owners: undefined })).rejects.toThrow('Owner must be specified')
  })

  it('throws an error if genesis record has more than one owner', async () => {
    const owners = [...RECORDS.genesis.owners, '0x25954ef14cebbc9af3d79876489a9cfe87043f20@eip155:1']

    await expect(handler.makeGenesis({ doctype: 'account-link', owners: owners, content: "did:3:bafyreiecedg6ipyvwdwycdjiakhj5hiuuutxlvywtkvckwvsnu6pjbwxae" })).rejects.toThrow(/Exactly one owner/i)
  })

  it('applies genesis record correctly', async () => {
    const state = await handler.applyGenesis(RECORDS.genesis, FAKE_CID_1)

    expect(state).toEqual({
      doctype: AccountLinkHandler.DOCTYPE,
      owners: RECORDS.genesis.owners,
      content: RECORDS.genesis.content,
      nextContent: null,
      log: [FAKE_CID_1]
    })
  })

  it('makes signed record correctly', async () => {
    const state = await handler.applyGenesis(RECORDS.genesis, FAKE_CID_1)

    const record = await handler.makeRecord(state, 'did:3:bafyreiecedg6ipyvwdwycdjiakhj5hiuuutxlvywtkvckwvsnu6pjbwxad')

    expect(record).toEqual({ content: 'did:3:bafyreiecedg6ipyvwdwycdjiakhj5hiuuutxlvywtkvckwvsnu6pjbwxad', prev: FAKE_CID_1 })
  })

  it('applies signed record correctly', async () => {
    let state = await handler.applyGenesis(RECORDS.genesis, FAKE_CID_1)
    const record = await handler.makeRecord(state, 'did:3:bafyreiecedg6ipyvwdwycdjiakhj5hiuuutxlvywtkvckwvsnu6pjbwxad')
    state = await handler.applySigned(record, FAKE_CID_2, state)

    expect(state).toEqual({
      doctype: AccountLinkHandler.DOCTYPE,
      owners: RECORDS.genesis.owners,
      nextContent: null,
      content: 'did:3:bafyreiecedg6ipyvwdwycdjiakhj5hiuuutxlvywtkvckwvsnu6pjbwxae',
      log: [FAKE_CID_1, FAKE_CID_2]
    })
  })

})
