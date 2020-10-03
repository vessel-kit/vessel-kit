import { MessageTyp } from "./message-typ";
import CID from "cids";

export interface UpdateMessage {
  typ: MessageTyp.UPDATE;
  id: string;
  cid: CID;
}

export interface RequestMessage {
  typ: MessageTyp.REQUEST;
  id: string;
}

export interface ResponseMessage {
  typ: MessageTyp.RESPONSE;
  id: string;
  cid: CID;
}

export type CloudMessage = UpdateMessage | RequestMessage | ResponseMessage;
