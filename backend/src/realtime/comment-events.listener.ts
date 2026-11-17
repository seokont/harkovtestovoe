import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { CommentsGateway } from './comments.gateway.js';
import type { CommentNode } from '../entry/entry.service.js';

@Injectable()
export class CommentEventsListener {
  constructor(
    private readonly gateway: CommentsGateway,
    @InjectQueue('comments') private readonly queue: Queue,
  ) {}

  @OnEvent('comment.created')
  async handleCommentCreated(payload: { node: CommentNode }) {
    // Real-time broadcast to connected clients.
    this.gateway.broadcastCommentCreated(payload.node);

    // Offload an async job to the queue (e.g. notification/indexing).
    try {
      await this.queue.add(
        'notify',
        { entryId: payload.node.id, userName: payload.node.userName },
        { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
      );
    } catch (err) {
      console.warn(
        '[queue] failed to enqueue job:',
        (err as Error)?.message ?? err,
      );
    }
  }
}
