import { TileHandler } from '../tile.handler'
import CID from 'cids'

const FAKE_CID_1 = new CID('bafybeig6xv5nwphfmvcnektpnojts33jqcuam7bmye2pb54adnrtccjlsu')
const FAKE_CID_2 = new CID('bafybeig6xv5nwphfmvcnektpnojts33jqcuam7bmye2pb54adnrtccjlsr')
const RECORDS = {
  genesis: { doctype: 'tile', owners: [ 'did:3:bafyasdfasdf' ], content: { much: 'data' } },
  r1: {
    desiredContent: { much: 'data', very: 'content' },
    record: { content: [ { op: 'add', path: '/very', value: 'content' } ], prev: FAKE_CID_1 }
  },
  r2: { record: {}, proof: { blockNumber: 123456 } }
}

describe('TileHandler', () => {
  let handler


  beforeEach(() => {
    handler = new TileHandler()
  })

  it('makes genesis record correctly', async () => {
    const record1 = await handler.makeGenesis(RECORDS.genesis)
    expect(record1).toEqual(RECORDS.genesis)
  })

  it('applies genesis record correctly', async () => {
    const state = await handler.applyGenesis(RECORDS.genesis, FAKE_CID_1)
    expect(state).toEqual( {
      doctype: TileHandler.DOCTYPE,
      owners: state.owners,
      content: state.content,
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
    let state = await handler.applyGenesis(RECORDS.genesis, FAKE_CID_1)
    state = await handler.applySigned(RECORDS.r1.record, FAKE_CID_2, state)
    expect(state).toEqual({
      doctype: TileHandler.DOCTYPE,
      owners: [ 'did:3:bafyasdfasdf' ],
      content: { much: 'data' },
      nextContent: null,
      log: [FAKE_CID_1, RECORDS.r1.record]
    })
  })

})
