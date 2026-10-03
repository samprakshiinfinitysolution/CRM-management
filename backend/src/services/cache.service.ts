// src/services/cache.service.ts

import { getRedisClient, isRedisAvailable } from '../config/redis.js';
import { config } from '../config/env.js';
import { UserRole } from '../types/index.js';

export interface CachedUserSession {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  isActive: boolean;
  tokenIssuedAt?: number;
  lastActiveAt?: string;
}

export class CacheService {
  // Key Namespaces
  private static readonly SESSION_PREFIX = 'crm:session:user:';
  private static readonly USER_PREFIX = 'crm:cache:user:';
  private static readonly DB_PREFIX = 'crm:cache:db:';
  private static readonly BLACKLIST_PREFIX = 'crm:blacklist:token:';

  /**
   * Generic GET from Redis
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const client = getRedisClient();
      if (!client || !isRedisAvailable()) return null;

      const raw = await client.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /**
   * Generic SET to Redis with TTL
   */
  static async set(
    key: string,
    value: unknown,
    ttlSeconds: number = config.redis.defaultTtlSeconds
  ): Promise<boolean> {
    try {
      const client = getRedisClient();
      if (!client || !isRedisAvailable()) return false;

      const serialized = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await client.set(key, serialized);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generic DELETE from Redis
   */
  static async del(key: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      if (!client || !isRedisAvailable()) return false;

      await client.del(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Invalidate multiple keys by pattern (e.g. 'crm:cache:db:*')
   */
  static async delPattern(pattern: string): Promise<number> {
    try {
      const client = getRedisClient();
      if (!client || !isRedisAvailable()) return 0;

      let cursor = '0';
      let deletedCount = 0;
      do {
        const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await client.del(...keys);
          deletedCount += keys.length;
        }
      } while (cursor !== '0');

      return deletedCount;
    } catch {
      return 0;
    }
  }

  /**
   * Cache-Aside Helper: Read from Cache, or compute & cache in DB
   */
  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = config.redis.defaultTtlSeconds
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const freshData = await fetcher();
    if (freshData !== null && freshData !== undefined) {
      await this.set(key, freshData, ttlSeconds);
    }
    return freshData;
  }

  // -------------------------------------------------------------------------
  // User Session & Authentication Persistence (Zero-Logout on Deployment)
  // -------------------------------------------------------------------------

  /**
   * Save user session in Redis with 7-day TTL
   */
  static async saveUserSession(
    userId: string,
    session: CachedUserSession,
    ttlSeconds: number = config.redis.sessionTtlSeconds
  ): Promise<void> {
    const key = `${this.SESSION_PREFIX}${userId}`;
    await this.set(key, { ...session, lastActiveAt: new Date().toISOString() }, ttlSeconds);
  }

  /**
   * Get active user session from Redis
   */
  static async getUserSession(userId: string): Promise<CachedUserSession | null> {
    const key = `${this.SESSION_PREFIX}${userId}`;
    return await this.get<CachedUserSession>(key);
  }

  /**
   * Invalidate user session from Redis (e.g. on logout or password change)
   */
  static async invalidateUserSession(userId: string): Promise<void> {
    const sessionKey = `${this.SESSION_PREFIX}${userId}`;
    const profileKey = `${this.USER_PREFIX}${userId}`;
    await Promise.all([this.del(sessionKey), this.del(profileKey)]);
  }

  /**
   * Blacklist a revoked JWT token until it expires naturally
   */
  static async blacklistToken(token: string, expiresInSeconds: number = 7 * 86400): Promise<void> {
    const key = `${this.BLACKLIST_PREFIX}${token}`;
    await this.set(key, { blacklistedAt: new Date().toISOString() }, expiresInSeconds);
  }

  /**
   * Check if a JWT token has been explicitly revoked/blacklisted
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `${this.BLACKLIST_PREFIX}${token}`;
    const result = await this.get(key);
    return result !== null;
  }

  // -------------------------------------------------------------------------
  // Database Query Caching Helpers
  // -------------------------------------------------------------------------

  /**
   * Cache a database query result with automatic prefix
   */
  static async cacheDbQuery<T>(
    queryKey: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300 // 5 minutes default for DB queries
  ): Promise<T> {
    const key = `${this.DB_PREFIX}${queryKey}`;
    return await this.getOrSet<T>(key, fetcher, ttlSeconds);
  }

  /**
   * Invalidate database query caches
   */
  static async invalidateDbCache(pattern: string = '*'): Promise<number> {
    const fullPattern = `${this.DB_PREFIX}${pattern}`;
    return await this.delPattern(fullPattern);
  }
}
