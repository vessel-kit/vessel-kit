import { CeramicDocumentId } from '@potter/codec';
import { Document } from '../document';
import { DIDDocument, DIDResolver, ParsedDID } from 'did-resolver';
import { ThreeIdentifier } from '../three-identifier';
import CID from 'cids';
import { wrapThreeId } from '../handlers/verify-three-did';
import { ThreeIdContentJSONCodec } from '../three-id.content';
import { decodePromise } from '@potter/codec';

interface ILoad {
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
        const threeIdentifier = ThreeIdentifier.fromString(did);
        const docId = new CeramicDocumentId(new CID(threeIdentifier.address));
        const document = await this.load(docId);
        const threeId = await decodePromise(ThreeIdContentJSONCodec, document.current);
        const didPresentation = wrapThreeId(threeIdentifier.toString(), threeId);
        return didPresentation;
      },
    };
  }
}
