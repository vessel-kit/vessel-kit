import { Scheme, SchemeDefaults } from './scheme';

export class ConnectionString {
  #options: Map<string, string>;
  #scheme: Scheme
  #original: URL

  constructor(scheme: Scheme, original: URL, options: Map<string, string>) {
    this.#options = options;
    this.#scheme = scheme
    this.#original = original
  }

  get chain() {
    return this.#scheme.chain
  }

  get messagingProtocol(): string {
    return this.#scheme.messaging
  }

  get options(): Map<string, string> {
    return this.#options
  }

  get transportProtocol (): string {
    return this.#scheme.transport
  }

  get transport(): string {
    return `${this.#scheme.transport}://${this.#original.host}${this.#original.pathname}`
  }

  static fromString(input: string, defaults?: SchemeDefaults): ConnectionString {
    const url = new URL(input);
    const scheme = Scheme.fromURL(url, defaults);
    return new ConnectionString(scheme, url, new Map(url.searchParams));
  }

  static isValid(input: string): boolean {
    try {
      const url = new URL(input)
      return Scheme.isValid(url.protocol.replace(/:$/, ''))
    } catch (e) {
      return false
    }
  }

  toString() {
    return this.#original.toString()
  }
}
