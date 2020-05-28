export interface IHandler {
  makeGenesis(content: any): Promise<any & { doctype: string }>;
  applyGenesis(genesis: any): Promise<any & { doctype: string }>; // TODO any??
}
