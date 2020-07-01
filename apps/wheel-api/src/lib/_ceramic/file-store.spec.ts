import { FileStore } from './file-store';
import { Ipfs } from 'ipfs';
import CID from 'cids';

function fakeIPFS(get: Function, put: Function) {
  return {
    dag: {
      get,
      put,
    },
  } as Ipfs
}

const cid = new CID('bafyreihz4grumy4fp3zpa6xazu32wd7evlrkpdaeyc2xwqoedhgcrbtusy')

test('#get', async () => {
  const expectedValue = 'get'
  const get = jest.fn(() => Promise.resolve({value: expectedValue}))
  const ipfs = fakeIPFS(get, jest.fn())
  const fileStore = new FileStore(ipfs)
  const result = await fileStore.get(cid)
  expect(result).toEqual(expectedValue)
  expect(get).toBeCalledWith(cid)
});

test('#put', async () => {
  const expectedValue = cid
  const blob = 'foo'
  const put = jest.fn(() => Promise.resolve(expectedValue))
  const ipfs = fakeIPFS(jest.fn(), put)
  const fileStore = new FileStore(ipfs)
  const actual = await fileStore.put(blob)
  expect(actual).toEqual(expectedValue)
  expect(put).toBeCalledWith(blob)
})
