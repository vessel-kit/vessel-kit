import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

export enum ActionTypes {
  Room = 'room',
}

@WebSocketGateway(3010)
export class LiveGateway implements OnGatewayConnection, OnGatewayDisconnect {
  connectedClients: string[] = [];
  data = {};
  @WebSocketServer()
  // @ts-ignore
  server: Server;
  private logger: Logger = new Logger();

  handleConnection(client: Socket) {
    this.connectedClients = [...this.connectedClients, client.id];
    this.logger.log(
      `Client connected: ${client.id} - ${this.connectedClients.length} connected clients.`,
    );
  }

  handleDisconnect(client: Socket) {
    this.connectedClients = this.connectedClients.filter(
      (connectedClient) => connectedClient !== client.id,
    );
    this.logger.log(
      `Client disconnected: ${client.id} - ${this.connectedClients.length} connected clients.`,
    );
  }

  @SubscribeMessage(ActionTypes.Room)
  room(client: Socket, payload: any) {
    client.join(payload);
  }

  sendUpdate(cid: string, content: any) {
    this.server.to(cid).emit('live-update', content);
  }
}
