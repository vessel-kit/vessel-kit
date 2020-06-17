import { ThreeIdHandler } from '../three-id.handler'
import CID from 'cids'

const FAKE_CID_1 = new CID('bafybeig6xv5nwphfmvcnektpnojts33jqcuam7bmye2pb54adnrtccjlsu')
const FAKE_CID_2 = new CID('bafybeig6xv5nwphfmvcnektpnojts33jqcuam7bmye2pb54adnrtccjlsr')
const RECORDS = {
  genesis: { doctype: '3id', owners: [ '0x123' ], content: { publicKeys: { test: '0xabc' } } },
  r1: {
    desiredContent: { publicKeys: { test: '0xabc' }, other: 'data' },
    desiredContent2: { publicKeys: { test: '0xabc' } },
    record: { content: [ { op: 'add', path: '/other', value: 'data' } ], prev: FAKE_CID_1}
  },
  r2: { record: {}, proof: { blockNumber: 123456 } }
}

describe('ThreeIdHandler', () => {
  let handler

  beforeEach(() => {
    handler = new ThreeIdHandler()
  })

  it('makes genesis record correctly', async () => {
    const record = await handler.makeGenesis({ content: RECORDS.genesis.content, owners: RECORDS.genesis.owners })
    expect(record).toEqual(RECORDS.genesis)
  })

  it('applies genesis record correctly', async () => {
    const state = await handler.applyGenesis(RECORDS.genesis, FAKE_CID_1)
    expect(state).toEqual({
      doctype: ThreeIdHandler.DOCTYPE,
      owners: RECORDS.genesis.owners,
      content: RECORDS.genesis.content,
      nextContent: null,
      log: [FAKE_CID_1]
    })
  })

  it('makes signed record correctly', async () => {
    const state = await handler.applyGenesis(RECORDS.genesis, FAKE_CID_1)
    const record = await handler.makeRecord(state, RECORDS.r1.desiredContent)
    expect(record).toEqual(RECORDS.r1.record)
  })

  it('applies signed record correctly', async () => {
    const state = await handler.applyGenesis(RECORDS.genesis, FAKE_CID_1)
    const record = await handler.makeRecord(state, RECORDS.r1.desiredContent)
    const state2 = await handler.applySigned(record, FAKE_CID_2, state)
    expect(state2).toEqual({
      doctype: ThreeIdHandler.DOCTYPE,
      owners: state.owners,
      content: RECORDS.r1.desiredContent2,
      nextContent: null,
      log: [FAKE_CID_1, record]
    })
  })
})
