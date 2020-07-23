import CID from 'cids';
import * as t from 'io-ts';
import { CidStringCodec } from '@potter/codec';

export class History {
  #log: CID[];
  #set: Set<string>
  #first: CID
  #last: CID

  constructor(log: CID[]) {
    this.#last = log[log.length - 1]
    this.#first = log[0]
    this.#log = log
    this.#set = new Set(log.map(cid => cid.toString()))
  }

  get first() {
    return this.#first
  }

  get last() {
    return this.#last
  }

  get log() {
    return this.#log
  }

  findIndex(fn: (item: CID) => boolean) {
    return this.log.findIndex(fn)
  }

  slice(index: number) {
    const next = this.log.slice(index)
    return new History(next)
  }

  async reduce<A>(f: (acc: A, item: CID) => Promise<A>, initial: A) {
    let acc = initial
    for (let item of this.#log) {
      acc = await f(acc, item)
    }
    return acc
  }

  has(cid: CID) {
    return this.#set.has(cid.toString())
  }


  concat(cid: CID) {
    return new History(this.log.concat(cid))
  }

  isEmpty() {
    return this.log.length === 0
  }

  get [Symbol.toStringTag]() {
    const log = this.#log.map(cid => cid.toString()).join(', ')
    return `<Chain log: [${log}]>`;
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this[Symbol.toStringTag]
  }

  toJSON() {
    return this.#log.map(cid => cid.toString())
  }
}

export const HistoryCidArrayCodec = new t.Type<History, CID[], CID[]>(
  'Chain-Array<CID>',
  (input: unknown): input is History => input instanceof History,
  input => {
    return t.success(new History(input));
  },
  (a: History) => a.log,
);

export const HistoryCodec = t.array(t.string.pipe(CidStringCodec)).pipe(HistoryCidArrayCodec)
