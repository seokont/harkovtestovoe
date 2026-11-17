import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CommentsGateway } from './comments.gateway.js';
import { CommentEventsListener } from './comment-events.listener.js';

@Module({
  imports: [BullModule.registerQueue({ name: 'comments' })],
  providers: [CommentsGateway, CommentEventsListener],
  exports: [CommentsGateway],
})
export class RealtimeModule {}
