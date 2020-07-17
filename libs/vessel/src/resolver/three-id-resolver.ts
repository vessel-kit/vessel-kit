import { CeramicDocumentId } from '@potter/codec';
import { Document } from '../document/document';
import { DIDDocument, DIDResolver, ParsedDID } from 'did-resolver';
import CID from 'cids';
import { ThreeIdContent, ThreeIdContentJSONCodec } from '../three-id.content';
import { decodeThrow } from '@potter/codec';
import { DidPresentation } from '../did.presentation';

export interface ILoad {
  (docId: CeramicDocumentId): Promise<Document>;
}

interface ResolverRegistry {
  [index: string]: DIDResolver;
}

export function wrapThreeId(id: string, content: ThreeIdContent): DIDDocument {
  const presentation = new DidPresentation(id, content)
  return presentation.toJSON()
}

export class ThreeIdResolver {
  registry: ResolverRegistry;

  constructor(private readonly load: ILoad) {
    this.registry = {
      '3': async (did: string, parsed: ParsedDID): Promise<DIDDocument | null> => {
        const docId = new CeramicDocumentId(new CID(parsed.id));
        const document = await this.load(docId);
        const threeId = decodeThrow(ThreeIdContentJSONCodec, document.current);
        return wrapThreeId(did, threeId);
      },
    };
  }
}
