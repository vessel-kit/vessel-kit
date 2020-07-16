declare module 'ses' {
  global {
    function lockdown(): void;
    class Compartment {
      constructor(intrinsics?: any);
      evaluate(code: string): any
    }
  }
}
