export interface DecodedSignatureHeader {
  alg: string;
  kid: string;
}

export interface DecodedSignature {
  header: DecodedSignatureHeader;
  payload: object;
  signature: Uint8Array;
}

// decodeSignature = why?
// verify signature

// compact, json

// asCompact
// asDetached
