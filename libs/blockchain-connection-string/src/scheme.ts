const SCHEME_PART = '([a-z][a-z\\d\\-\\.]+)';
const SCHEME_REGEXP = new RegExp(`^${SCHEME_PART}\\+${SCHEME_PART}\\+${SCHEME_PART}$`);
const KNOWN_TRANSPORT_REGEXP = new RegExp(/^(https|wss|ws|http|grpc)$/);

export class InvalidSchemeError extends Error {}

export class MissedDefaultsError extends Error {}

/* istanbul ignore next */
export class UnexpectedSchemeCase extends Error {
  constructor(schemeCase: never) {
    super(schemeCase);
  }
}

export interface SchemeDefaults {
  chain: string;
  messaging: string;
}

export enum SchemeCase {
  FULL_SCHEME,
  KNOWN_TRANSPORT,
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

  static case(input: string): [SchemeCase, RegExpExecArray] | null {
    const match = SCHEME_REGEXP.exec(input);
    if (match) {
      return [SchemeCase.FULL_SCHEME, match];
    } else {
      const knownTransportMatch = KNOWN_TRANSPORT_REGEXP.exec(input);
      if (knownTransportMatch) {
        return [SchemeCase.KNOWN_TRANSPORT, knownTransportMatch];
      } else {
        return null;
      }
    }
  }

  static isValid(protocol: string) {
    return Boolean(Scheme.case(protocol));
  }

  static fromURL(url: URL, defaults?: SchemeDefaults) {
    const protocol = url.protocol.replace(/:$/, '');
    return Scheme.fromString(protocol, defaults);
  }

  static fromString(input: string, defaults?: SchemeDefaults) {
    const schemeCase = Scheme.case(input);
    if (schemeCase) {
      const match = schemeCase[1];
      switch (schemeCase[0]) {
        case SchemeCase.FULL_SCHEME:
          return new Scheme(match[1], match[2], match[3]);
        case SchemeCase.KNOWN_TRANSPORT:
          if (defaults) {
            return new Scheme(defaults.chain, defaults.messaging, match[1]);
          } else {
            throw new MissedDefaultsError(`Known transport ${input} requires defaults, got none`);
          }
        /* istanbul ignore next */
        default:
          throw new UnexpectedSchemeCase(schemeCase[0]);
      }
    } else {
      throw new InvalidSchemeError(`Received invalid scheme: ${input}`);
    }
  }

  toString() {
    return `${this.chain}+${this.messaging}+${this.transport}`;
  }
}
