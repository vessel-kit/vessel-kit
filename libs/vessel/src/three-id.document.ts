import { PublicKey } from './public-key';

export class ThreeIdDocument {
  owners: PublicKey[];
  publicKeys: Map<string, PublicKey>;
}
