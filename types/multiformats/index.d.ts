declare module 'multiformats' {
  export namespace varint {
    export function decode(data: Uint8Array): [number, number];
    export function encodeTo(int: number, target: Uint8Array, offset?: number): Uint8Array;
    export function encodingLength(int: number): number;
  }

  export namespace bytes {
    export function equals(aa: Uint8Array, bb: Uint8Array): boolean;
    export function coerce(o: ArrayBufferView | ArrayBuffer): Uint8Array;
    export function isBinary(o: any): o is ArrayBuffer | ArrayBufferView;
    export function fromHex(hex: string): Uint8Array;
    export function toHex(d: Uint8Array): string;
    export function fromString(str: string): Uint8Array;
    export function toString(b: Uint8Array): string;
    export const empty: Uint8Array;
  }

  export namespace digest {
    export class Digest {
      constructor(code: number, size: number, digest: Uint8Array, bytes: Uint8Array) {}
      code: number;
      size: number;
      digest: Uint8Array;
      bytes: Uint8Array;
    }
    export function create(code: number, digest: Uint8Array): Uint8Array;
    export function decode(multihash: Uint8Array): Digest;
    export function equals(a: Digest, b: Digest): boolean;
  }

  export namespace hasher {
    export class Hasher {
      name: string;
      code: number;
      encode: (input: Uint8Array) => PromiseLike<Uint8Array>;
      constructor(name: string, code: number, encode: (input: Uint8Array) => PromiseLike<Uint8Array>) {}
      digest(input: Uint8Array): Promise<digest.Digest>;
    }
    export function from(options: {
      name: string;
      code: number;
      encode: (input: Uint8Array) => PromiseLike<Uint8Array>;
    }): Hasher;
  }

  export namespace codec {
    export class Encoder<T> {
      name: string;
      code: number;
      encode: (data: T) => Uint8Array;
      constructor(name: string, code: number, encode: (data: T) => Uint8Array) {}
    }

    export class Decoder<T> {
      name: string;
      code: number;
      decode: (bytes: Uint8Array) => T;
      constructor(name: string, code: number, decode: (bytes: Uint8Array) => T) {}
    }

    export class Codec<T> {
      name: string;
      code: number;
      encode: (data: T) => Uint8Array;
      decode: (bytes: Uint8Array) => T;
      decoder: Decoder<T>;
      encoder: Encoder<T>;
      constructor(name: string, code: number, encode: (data: T) => Uint8Array, decode: (bytes: Uint8Array) => T) {}
    }

    export function codec<T>(options: {
      name: string;
      code: number;
      encode: (data: T) => Uint8Array;
      decode: (bytes: Uint8Array) => T;
    }): Codec<T>;
  }

  export class CID {
    version: number;
    code: number;
    bytes: Uint8Array;

    static asCID(value: unknown): CID | null;
  }
}
