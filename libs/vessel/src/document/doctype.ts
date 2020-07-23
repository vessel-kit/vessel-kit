import { ISimpleCodec } from '@potter/codec';
import { IWithDoctype } from './with-doctype.interface';
import { EMPTY_CONTEXT, IContext } from '../context';
import { DocumentState } from './document.state';
import { CeramicDocumentId, RecordWrap } from '@potter/codec';
import { AnchorProof, AnchoringStatus } from '@potter/anchoring';
import { IDocument } from './document.interface';
import jsonPatch from 'fast-json-patch';
import { UpdateRecordWaiting } from '../util/update-record.codec';
import { History } from '../util/history';
import produce from 'immer';
import { InvalidDocumentUpdateLinkError } from '../doctypes/invalid-document-update-link.error';

abstract class GenericHandler<Freight extends IWithDoctype> {
  abstract readonly name: string;
  abstract readonly json: ISimpleCodec<Freight>;
  readonly context: IContext;

  constructor(context: IContext = EMPTY_CONTEXT) {
    this.context = context;
  }

  withContext(context: IContext): this {
    return Reflect.construct(this.constructor, [context]);
  }
}

export abstract class DoctypeHandler<
  Freight extends IWithDoctype = IWithDoctype,
  State extends DoctypeState<Shape> = any,
  Shape = any
> extends GenericHandler<Freight> {
  abstract knead(genesisRecord: unknown): Promise<State>;

  async genesisFromFreight(payload: Omit<Freight, 'doctype'>): Promise<any & IWithDoctype> {
    const applied = Object.assign({}, payload, { doctype: this.name }) as Freight;
    return this.json.encode(applied);
  }

  async update(document: IDocument, next: Freight) {
    const nextJSON = this.json.encode(next);
    const currentJSON = document.current;
    const patch = jsonPatch.compare(currentJSON, nextJSON);
    const payloadToSign = UpdateRecordWaiting.encode({
      patch: patch,
      prev: document.log.last,
      id: document.id,
    });
    return this.context.sign(payloadToSign);
  }

  async applyGenesis(documentId: CeramicDocumentId, genesis: any): Promise<DocumentState> {
    return {
      doctype: genesis.doctype,
      current: null,
      freight: genesis,
      anchor: {
        status: AnchoringStatus.NOT_REQUESTED as AnchoringStatus.NOT_REQUESTED,
      },
      log: new History([documentId.cid]),
    };
  }

  async applyAnchor(anchorRecord: RecordWrap, proof: AnchorProof, state: DocumentState): Promise<DocumentState> {
    return produce(state, async (next) => {
      next.log = next.log.concat(anchorRecord.cid);
      if (next.current) {
        next.freight = next.current;
        next.current = null;
      }
      next.anchor = {
        status: AnchoringStatus.ANCHORED as AnchoringStatus.ANCHORED,
        proof: {
          chainId: proof.chainId.toString(),
          blockNumber: proof.blockNumber,
          timestamp: new Date(proof.blockTimestamp * 1000),
          txHash: proof.txHash,
          root: proof.root,
        },
      };
    });
  }

  async applyUpdate(updateRecord: RecordWrap, state: DocumentState): Promise<DocumentState> {
    if (!(updateRecord.load.id && updateRecord.load.id.equals(state.log.first))) {
      throw new InvalidDocumentUpdateLinkError(`Expected ${state.log.first} id while got ${updateRecord.load.id}`);
    }
    await this.context.assertSignature(updateRecord.load);
    const next = jsonPatch.applyPatch(state.current || state.freight, updateRecord.load.patch, false, false)
      .newDocument;
    return {
      ...state,
      current: next,
      log: state.log.concat(updateRecord.cid),
      anchor: {
        status: AnchoringStatus.NOT_REQUESTED,
      },
    };
  }
}

export interface DoctypeState<Shape> {
  cone(): Shape;
}

export interface IDoctype<
  State extends DoctypeState<Shape> = any,
  Freight extends IWithDoctype = IWithDoctype,
  Shape = any
> {
  name: string;
  json: ISimpleCodec<Freight>;
  context: IContext;

  withContext(context: IContext): this;

  // Genesis record from typed payload
  genesisFromFreight(payload: Omit<Freight, 'doctype'>): Promise<any & IWithDoctype>;
  // Return signed payload based on current and next freight
  update(document: IDocument, next: Freight): Promise<any & IWithDoctype>;

  applyGenesis(documentId: CeramicDocumentId, genesis: any): Promise<DocumentState>;
  applyAnchor(anchorRecord: RecordWrap, proof: AnchorProof, state: DocumentState): Promise<DocumentState>;
  applyUpdate(updateRecord: RecordWrap, state: DocumentState): Promise<DocumentState>;

  knead(genesisRecord: unknown): Promise<State>;
}
