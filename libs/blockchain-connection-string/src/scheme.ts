const SCHEME_PART = '([a-z][a-z\\d\\-\\.]+)';
const SCHEME_REGEXP = new RegExp(`^${SCHEME_PART}\\+${SCHEME_PART}\\+${SCHEME_PART}$`);
const KNOWN_TRANSPORT_REGEXP = new RegExp(/^(https|wss|ws|http|grpc)$/);

export class InvalidSchemeError extends Error {}

export class MissedDefaultsError extends Error {}

export interface SchemeDefaults {
  chain: string;
  messaging: string;
}

export class Scheme {
  chain: string;
  messaging: string;
  transport: string;

  constructor(chain: string, messaging: string, transport: string) {
    this.chain = chain;
    this.messaging = messaging;
    this.transport = transport;
  }

  static fromURL(url: URL, defaults?: SchemeDefaults) {
    const protocol = url.protocol.replace(/:$/, '');
    return Scheme.fromString(protocol, defaults);
  }

  static fromString(input: string, defaults?: SchemeDefaults) {
    const match = SCHEME_REGEXP.exec(input);
    if (match) {
      return new Scheme(match[1], match[2], match[3]);
    } else {
      const knownTransportMatch = KNOWN_TRANSPORT_REGEXP.exec(input);
      if (knownTransportMatch && defaults) {
        return new Scheme(defaults.chain, defaults.messaging, knownTransportMatch[1]);
      } else if (knownTransportMatch && !defaults) {
        throw new MissedDefaultsError(`Known transport ${input} requires defaults, got none`);
      } else {
        throw new InvalidSchemeError(`Received invalid scheme: ${input}`);
      }
    }
  }

  toString() {
    return `${this.chain}+${this.messaging}+${this.transport}`;
  }
}
