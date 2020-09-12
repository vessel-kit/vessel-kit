declare module 'multihashes' {
  export function toHexString(hash: Uint8Array): string;
  export function fromHexString(hash: string): Uint8Array;
  export function toB58String(hash: Uint8Array): string;
  export function fromB58String(hash: string | Uint8Array): Uint8Array;
  export function decode(bytes: Uint8Array): { code: number; name: string; length: number; digest: Uint8Array };
  export function encode(digest: Uint8Array, code: string | number, length?: number): Uint8Array;
  export function coerceCode(name: string | number): number;
  export function isAppCode(code: number): boolean;
  export function isValidCode(code: number): boolean;
  export function prefix(multihash: Uint8Array): Uint8Array;
}
