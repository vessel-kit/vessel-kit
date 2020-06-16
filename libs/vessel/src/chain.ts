import CID from 'cids';

export class Chain {
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
    return new Chain(this.log.concat(cid))
  }

  isEmpty() {
    return this.log.length === 0
  }

  get [Symbol.toStringTag]() {
    const log = this.#log.map(cid => cid.toString()).join(', ')
    return `<Chain log: [${log}]>`;
  }
}
