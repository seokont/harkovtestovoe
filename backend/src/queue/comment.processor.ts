import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('comments')
export class CommentProcessor extends WorkerHost {
  @OnWorkerEvent('error')
  onError(err: Error) {
    // Redis may be temporarily unavailable; log instead of crashing the process.
    console.warn('[queue] worker error:', err?.message ?? err);
  }

  async process(job: Job<{ entryId: string; userName: string }>) {
    // Simulated async work: delivering a notification / indexing the comment.
    await new Promise((resolve) => setTimeout(resolve, 50));
    return {
      ok: true,
      entryId: job.data.entryId,
      userName: job.data.userName,
      processedAt: new Date().toISOString(),
    };
  }
}
