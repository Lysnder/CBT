import { Queue } from 'bullmq';
import { PING_QUEUE, redisConnection } from '../connection';

const connection = redisConnection();
const queue = new Queue(PING_QUEUE, { connection });
const job = await queue.add('ping', {});
console.log(`ping eklendi (job ${job.id})`);
await queue.close();
await connection.quit();
