declare module 'multihashes' {
  export function decode(
    b: Buffer,
  ): { code: number; name: string; length: number; digest: Buffer };
}
