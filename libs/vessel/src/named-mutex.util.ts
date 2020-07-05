import { Mutex} from 'await-semaphore'

export class NamedMutex {
  #named: Map<string, Mutex>
  constructor() {
    this.#named = new Map()
  }

  get(name: string): Mutex {
    const found = this.#named.get(name)
    if (found) {
      return found
    } else {
      const mutex = new Mutex()
      this.#named.set(name, mutex)
      return mutex
    }
  }

  async use<A>(name: string, f: () => Promise<A>) {
    const mutex = this.get(name)
    const result = await mutex.use(f)
    this.#named.delete(name)
    return result
  }
}
