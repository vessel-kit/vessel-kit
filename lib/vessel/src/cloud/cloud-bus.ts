import { Ipfs } from "ipfs";
import { ILogger } from "../util/logger.interface";
import { queueScheduler, Subject } from "rxjs";
import { CloudMessage } from "./cloud-message";
import { MessageTyp } from "./message-typ";
import CID from "cids";
import { bind } from "decko";
import { UnknownMessageError } from "./cloud";
import { DocId } from "@vessel-kit/codec";

function rawMessageToDelta(message: any): CloudMessage {
  const { typ, id, cid } = JSON.parse(message.data);
  switch (typ) {
    case MessageTyp.UPDATE:
      if (typeof cid !== "string") throw new UnknownMessageError(message.data);
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
      return {
        typ: MessageTyp.RESPONSE,
        id: id,
        cid: new CID(cid),
      };
    default:
      throw new UnknownMessageError(message.data);
  }
}

export class CloudBus {
  #ipfs: Ipfs;
  #logger: ILogger;
  #message$ = new Subject<CloudMessage>();
  #peerId: string | undefined;

  static TOPIC = "/vessel";

  constructor(logger: ILogger, ipfs: Ipfs) {
    this.#logger = logger.withContext(CloudBus.name);
    this.#ipfs = ipfs;
    this.#peerId = undefined;
  }

  get message$(): Subject<CloudMessage> {
    return this.#message$;
  }

  request(id: string) {
    queueScheduler.schedule(async () => {
      await this.#ipfs.pubsub.publish(
        CloudBus.TOPIC,
        JSON.stringify({ typ: MessageTyp.REQUEST, id })
      );
    });
  }

  publishHead(docId: DocId, head: CID): void {
    queueScheduler.schedule(async () => {
      const message = {
        typ: MessageTyp.UPDATE,
        id: docId.toString(),
        cid: head.toString(),
      };
      this.#logger.debug(`Publishing head`, message);
      await this.#ipfs.pubsub.publish(CloudBus.TOPIC, JSON.stringify(message));
    });
  }

  publishResponse(docId: DocId, head: CID) {
    queueScheduler.schedule(async () => {
      const message = {
        typ: MessageTyp.RESPONSE,
        id: docId.toString(),
        cid: head.toString(),
      };
      this.#logger.debug(`Publishing response`, message);
      await this.#ipfs.pubsub.publish(CloudBus.TOPIC, JSON.stringify(message));
    });
  }

  async peerId(): Promise<string> {
    if (this.#peerId) {
      return this.#peerId;
    } else {
      const id = (await this.#ipfs.id()).id;
      this.#peerId = id;
      return id;
    }
  }

  listen() {
    queueScheduler.schedule(async () => {
      this.#logger.debug(`Subscribing to ${CloudBus.TOPIC}`);
      await this.#ipfs.pubsub.subscribe(CloudBus.TOPIC, this.messageHandler);
      this.#logger.log(`Subscribed to ${CloudBus.TOPIC}`);
    });
  }

  @bind()
  async messageHandler(raw: any) {
    const peerId = await this.peerId();
    const isOuter = raw.from != peerId;
    if (isOuter) {
      const message = rawMessageToDelta(raw);
      this.#logger.debug(`Received message`, message);
      this.#message$.next(message);
    }
  }
}
