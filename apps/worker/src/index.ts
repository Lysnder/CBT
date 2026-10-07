import { Worker } from 'bullmq';
import { PING_QUEUE, redisConnection } from './connection';

const connection = redisConnection();

const worker = new Worker(
  PING_QUEUE,
  async (job) => {
    console.log(`pong (job ${job.id})`);
    return 'pong';
  },
  { connection },
);

worker.on('ready', () => console.log('worker ready'));
worker.on('failed', (job, error) => console.error(`job ${job?.id} failed: ${error.message}`));
worker.on('error', (error) => console.error(`worker error: ${error.message}`));

function shutdown() {
  // Redis'e ulaşılamıyorsa close() bekleyebilir; 3 sn sonra zorla çık.
  setTimeout(() => process.exit(0), 3000).unref();
  void worker.close().finally(() => {
    connection.disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
