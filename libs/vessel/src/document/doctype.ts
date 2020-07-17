import { Codec } from '@potter/codec';
import { IWithDoctype } from './with-doctype.interface';
import { EMPTY_CONTEXT, IContext } from '../context';
import { DocumentState } from './document.state';
import { CeramicDocumentId, RecordWrap } from '@potter/codec';
import { AnchorProof } from '@potter/anchoring';

export interface IDoctype<Freight extends IWithDoctype = IWithDoctype> {
  _doctype: true;
  name: string;
  json: Codec<Freight>;
  context: IContext;

  // Return payload as JSON
  makeGenesis(genesisRecord: any): Promise<any & IWithDoctype>;

  applyGenesis(documentId: CeramicDocumentId, genesis: any): Promise<DocumentState>;
  applyAnchor(anchorRecord: RecordWrap, proof: AnchorProof, state: DocumentState): Promise<DocumentState>;
  applyUpdate(updateRecord: RecordWrap, state: DocumentState): Promise<DocumentState>;
}

type IDoctypeInput<Freight extends IWithDoctype> = Omit<IDoctype<Freight>, '_doctype' | 'name' | 'json' | 'context'>;

export function doctype<Freight extends IWithDoctype>(
  name: string,
  json: Codec<Freight>,
  handler: IDoctypeInput<Freight>,
): IDoctype<Freight> {
  return {
    _doctype: true,
    name: name,
    json: json,
    context: EMPTY_CONTEXT,
    ...handler,
  };
}

export function withContext<Freight extends IWithDoctype>(d: IDoctype<Freight>, context: IContext): IDoctype<Freight> {
  return Object.assign({}, d, { context });
}
