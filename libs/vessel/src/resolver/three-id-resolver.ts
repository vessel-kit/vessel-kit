import { DocId } from '@vessel-kit/codec';
import { DIDDocument, DIDResolver, ParsedDID } from 'did-resolver';
import CID from 'cids';
import { DidPresentation } from '../doctypes/three-id/did.presentation';
import { IDocument } from '..';
import { ThreeIdShape } from '../doctypes/three-id/three-id-shape';
import { ThreeIdState } from '../doctypes/three-id/three-id-state';

export interface ILoad {
  (docId: DocId): Promise<IDocument<unknown, unknown>>;
}

interface ResolverRegistry {
  [index: string]: DIDResolver;
}

export class ThreeIdResolver {
  registry: ResolverRegistry;

  constructor(private readonly load: ILoad) {
    this.registry = {
      '3': async (did: string, parsed: ParsedDID): Promise<DIDDocument | null> => {
        const docId = new DocId(new CID(parsed.id));
        const document = await this.load(docId) as IDocument<ThreeIdState, ThreeIdShape>
        const shape = await document.canonical()
        return new DidPresentation(did, shape);
      },
    };
  }
}
