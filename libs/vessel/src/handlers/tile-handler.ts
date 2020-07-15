import { IHandler } from './handler.interface';
import { DocumentState } from '../document.state';
import { TileContent } from '../tile.content';
import { validatePromise } from '@potter/codec';
import produce from 'immer';
import { AnchoringStatus } from '@potter/anchoring';
import * as _ from 'lodash';
import base64url from 'base64url';
import sortKeys from 'sort-keys';
import * as didJwt from 'did-jwt';
import { Resolver } from 'did-resolver';
import { InvalidDocumentUpdateLinkError } from './three-id-handler';
import jsonPatch from 'fast-json-patch';

export class TileHandler implements IHandler {
  constructor(readonly resolver: Resolver) {}

  applyAnchor(anchorRecord, proof, state: DocumentState): Promise<DocumentState> {
    return produce(state, async (next) => {
      next.log = next.log.concat(anchorRecord.cid);
      if (next.current) {
        next.freight = next.current;
        next.current = null;
      }
      next.anchor = {
        status: AnchoringStatus.ANCHORED,
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

  applyGenesis(genesis: any): Promise<any> {
    return genesis;
  }

  async applyUpdate(record, state: DocumentState) {
    if (!(record.load.id && record.load.id.equals(state.log.first))) {
      throw new InvalidDocumentUpdateLinkError(`Expected ${state.log.first} id while got ${record.load.id}`);
    }
    await this.validateSignature(record.load);
    const next = jsonPatch.applyPatch(state.current || state.freight, record.load.patch, false, false);
    return {
      ...state,
      current: next.newDocument,
      log: state.log.concat(record.cid),
      anchor: {
        status: AnchoringStatus.NOT_REQUESTED,
      },
    };
  }

  async makeGenesis(content: any): Promise<any> {
    await validatePromise(TileContent, content);
    await this.validateSignature(content);
    return content;
  }

  async validateSignature(record: any): Promise<void> {
    const payloadObject = _.omit(record, ['header', 'signature']);
    payloadObject.prev = payloadObject.prev ? { '/': payloadObject.prev.toString() } : undefined;
    payloadObject.id = payloadObject.id ? { '/': payloadObject.id.toString() } : undefined;
    const encodedPayload = base64url(JSON.stringify(sortKeys(payloadObject, { deep: true })));
    const encodedHeader = base64url(JSON.stringify(record.header));
    const encodedSignature = record.signature;
    const jwt = [encodedHeader, encodedPayload, encodedSignature].join('.');
    try {
      await didJwt.verifyJWT(jwt, { resolver: this.resolver });
    } catch (e) {
      throw new Error('Invalid signature for signed record:' + e);
    }
  }
}