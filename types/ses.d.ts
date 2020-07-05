declare module 'ses' {
  export function lockdown(): void;
  export class Compartment {
    constructor(intrinsics?: any);
    evaluate(code: string): any
  }
}
