import { Redis } from 'ioredis';
import { getEnv } from '@cbt/config/env';

export const PING_QUEUE = 'ping';

// BullMQ, engelleyen komutlar için `maxRetriesPerRequest: null` ister.
export function redisConnection(): Redis {
  return new Redis(getEnv().REDIS_URL, { maxRetriesPerRequest: null });
}
