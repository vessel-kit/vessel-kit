export interface JWTHeader {
  typ: 'JWT';
  alg: string;
  [x: string]: any;
}

export interface JWTDecoded {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
  data: string;
}

export interface JWTPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  iat?: number;
  nbf?: number;
  type?: string;
  exp?: number;
  rexp?: number;
  [x: string]: any;
}
