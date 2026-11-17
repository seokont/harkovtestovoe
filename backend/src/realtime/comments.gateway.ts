import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { CommentNode } from '../entry/entry.service.js';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/comments',
})
export class CommentsGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  afterInit() {
    // no-op
  }

  handleConnection(client: Socket) {
    // optional: track connected clients
    void client;
  }

  broadcastCommentCreated(node: CommentNode) {
    this.server?.emit('comment:created', node);
  }
}
