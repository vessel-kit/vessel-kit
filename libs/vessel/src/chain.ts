import CID from 'cids';

export class Chain {
  #log: CID[];
  #set: Set<string>
  #init: CID
  #last: CID

  constructor(log: CID[]) {
    this.#last = log[log.length - 1]
    this.#init = log[0]
    this.#log = log
    this.#set = new Set(log.map(cid => cid.toString()))
  }

  get init() {
    return this.#init
  }

  get last() {
    return this.#last
  }

  get log() {
    return this.#log
  }

  has(cid: CID) {
    return this.#set.has(cid.toString())
  }
}
