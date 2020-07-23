import { CeramicDocumentId } from '@potter/codec';
import { Document } from '../document/document';
import { DIDDocument, DIDResolver, ParsedDID } from 'did-resolver';
import CID from 'cids';
import { ThreeId } from '../doctypes/three-id/three-id';
import { DidPresentation } from '../doctypes/three-id/did.presentation';

export interface ILoad {
  (docId: CeramicDocumentId): Promise<Document>;
}

interface ResolverRegistry {
  [index: string]: DIDResolver;
}

export class ThreeIdResolver {
  registry: ResolverRegistry;

  constructor(private readonly load: ILoad) {
    this.registry = {
      '3': async (did: string, parsed: ParsedDID): Promise<DIDDocument | null> => {
        const docId = new CeramicDocumentId(new CID(parsed.id));
        const document = await this.load(docId);
        const t = ThreeId.json.decode(document.current);
        return new DidPresentation(did, t);
      },
    };
  }
}
