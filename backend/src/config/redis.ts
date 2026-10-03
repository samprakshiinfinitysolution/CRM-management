// src/config/redis.ts

import { Redis, RedisOptions } from 'ioredis';
import { config } from './env.js';

let redisClient: Redis | null = null;
let isRedisConnected = false;

let hasLoggedNotice = false;

const createRedisClient = (): Redis | null => {
  try {
    const redisUrl = config.redis.url || process.env.REDIS_URL;

    // In test environment or when no redis configuration is provided, use seamless DB fallback
    if (!redisUrl && (!config.redis.host || config.redis.host === '127.0.0.1') && process.env.NODE_ENV === 'test') {
      return null;
    }

    // Only create client if URL is provided or explicitly configured
    if (!redisUrl && !process.env.REDIS_URL && !process.env.REDIS_HOST) {
      return null;
    }

    const options: RedisOptions = {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        if (times > 4) {
          return null; // Stop retrying after 4 attempts to preserve resources
        }
        return Math.min(times * 300, 3000);
      },
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
      lazyConnect: true,
    };

    if (redisUrl && redisUrl.trim().length > 0) {
      redisClient = new Redis(redisUrl, options);
    } else if (config.redis.host) {
      redisClient = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        ...options,
      });
    }

    if (redisClient) {
      redisClient.on('connect', () => {
        isRedisConnected = true;
        hasLoggedNotice = false;
        console.log('⚡ Redis Cache & Session Store connected successfully');
      });

      redisClient.on('ready', () => {
        isRedisConnected = true;
      });

      redisClient.on('error', (err: Error) => {
        isRedisConnected = false;
        if (!hasLoggedNotice && config.nodeEnv !== 'test') {
          hasLoggedNotice = true;
          console.warn(`⚠️ Redis Cache Notice: ${err.message}. Operating in Database fallback mode.`);
        }
      });

      redisClient.on('close', () => {
        isRedisConnected = false;
      });

      redisClient.connect().catch(() => {
        // Handled by event listener
      });
    }

    return redisClient;
  } catch {
    return null;
  }
};

export const getRedisClient = (): Redis | null => {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
};

export const isRedisAvailable = (): boolean => {
  return isRedisConnected && redisClient !== null && redisClient.status === 'ready';
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('Redis connection closed gracefully.');
    } catch {
      redisClient.disconnect();
    }
  }
};

export const redis = getRedisClient();
export default redis;
