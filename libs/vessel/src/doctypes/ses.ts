import 'ses';

declare global {
  function lockdown(): void;
  class Compartment {
    constructor(intrinsics?: any);
    evaluate(code: string): any;
  }
}
