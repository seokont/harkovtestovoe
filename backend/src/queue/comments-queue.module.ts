import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CommentProcessor } from './comment.processor.js';

@Module({
  imports: [BullModule.registerQueue({ name: 'comments' })],
  providers: [CommentProcessor],
  exports: [BullModule],
})
export class CommentsQueueModule {}
