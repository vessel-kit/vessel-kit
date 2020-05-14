import { Ipfs } from 'ipfs';
import { bind } from 'decko';
import CID from 'cids';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

const TOPIC = '/ceramic';

export enum MessageTyp {
  UPDATE,
  REQUEST,
  RESPONSE,
}

export interface Update {
  typ: MessageTyp.UPDATE;
  id: string;
  cid: CID;
}

export interface Request {
  typ: MessageTyp.REQUEST;
  id: string;
}

export type Delta = Update | Request;

export class UnknownMessageError extends Error {
  constructor(message: any) {
    super(`Unknown message: ${JSON.stringify(message)}`);
  }
}

export class MessageBus {
  private readonly delta$ = new Subject<Delta | undefined>();
  private readonly message$ = new Subject<any>();

  protected constructor(
    private readonly ipfs: Ipfs,
    private readonly peerId: string,
  ) {
    this.message$
      .pipe(filter(this.isMessageFromOuterSpace), map(this.rawMessageToDelta))
      .subscribe(this.delta$);
  }

  static async build(ipfs: Ipfs) {
    const peerId = (await ipfs.id()).id;
    const transit = new MessageBus(ipfs, peerId);
    await ipfs.pubsub.subscribe(TOPIC, transit.handleTopicMessage);
    return transit;
  }

  forId$(id: string): Observable<Delta> {
    return this.delta$.pipe(filter(delta => delta && delta.id === id));
  }

  async publishHead (id: string, head: CID): Promise<void> {
    await this.ipfs.pubsub.publish(TOPIC, JSON.stringify({ typ: MessageTyp.UPDATE, id, cid: head.toString() }))
  }

  @bind()
  isMessageFromOuterSpace(message: any) {
    return message.from != this.peerId;
  }

  @bind()
  rawMessageToDelta(message: any) {
    const { typ, id, cid } = JSON.parse(message.data);
    switch (typ) {
      case MessageTyp.UPDATE:
        if (typeof cid !== 'string') throw new UnknownMessageError(message.data);
        return {
          typ: MessageTyp.UPDATE,
          id: id,
          cid: new CID(cid),
        };
      case MessageTyp.REQUEST:
        return {
          typ: MessageTyp.REQUEST,
          id: id,
        };
      case MessageTyp.RESPONSE:
        return;
      default:
        throw new UnknownMessageError(message.data);
    }
  }

  @bind()
  handleTopicMessage(message: any) {
    this.message$.next(message);
  }
}
