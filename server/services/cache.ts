/**
 * Caching Service for Q-GRID
 *
 * Provides Redis-based caching with in-memory fallback for development.
 * Used for:
 * - Transaction history caching (fraud detection performance)
 * - User statistics caching
 * - Agent execution results
 * - Rate limiting data
 *
 * Cache invalidation strategies:
 * - TTL-based expiration
 * - Event-driven invalidation on writes
 * - Manual invalidation via cache keys
 */

import { createHash } from 'crypto';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  defaultTTL?: number; // seconds
  maxMemoryItems?: number; // for in-memory fallback
}

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  tags: string[];
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  itemCount: number;
  memoryUsage?: number;
}

// Default TTLs for different cache types (in seconds)
export const CACHE_TTLS = {
  TRANSACTION_HISTORY: 60, // 1 minute - frequently updated
  RECENT_TRANSACTIONS: 30, // 30 seconds - very dynamic
  USER_STATS: 120, // 2 minutes
  WALLET_DATA: 60, // 1 minute
  FRAUD_ANALYSIS: 300, // 5 minutes - results don't change quickly
  AGENT_EXECUTION: 600, // 10 minutes
  PQC_INVENTORY: 3600, // 1 hour - inventory changes slowly
  PQC_RISK_ASSESSMENT: 1800, // 30 minutes
};

// Cache key prefixes for organization
export const CACHE_KEYS = {
  TRANSACTIONS: 'tx',
  RECENT_TX: 'recent_tx',
  USER_STATS: 'user_stats',
  WALLET: 'wallet',
  FRAUD: 'fraud',
  AGENT: 'agent',
  PQC: 'pqc',
};

// ============================================
// IN-MEMORY CACHE (Fallback/Development)
// ============================================

class InMemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  private stats = { hits: 0, misses: 0 };
  private maxItems: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxItems: number = 10000) {
    this.maxItems = maxItems;
    this.startCleanupInterval();
  }

  private startCleanupInterval(): void {
    // Clean expired entries every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 30000);
  }

  private cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (entry.expiresAt <= now) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.delete(key));
  }

  private evictIfNeeded(): void {
    if (this.cache.size >= this.maxItems) {
      // Simple LRU-like eviction: remove oldest 10% of items
      const toRemove = Math.ceil(this.maxItems * 0.1);
      const keys = Array.from(this.cache.keys()).slice(0, toRemove);
      keys.forEach(key => this.delete(key));
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  async set<T>(key: string, data: T, ttlSeconds: number, tags: string[] = []): Promise<void> {
    this.evictIfNeeded();

    const entry: CacheEntry<T> = {
      data,
      expiresAt: Date.now() + (ttlSeconds * 1000),
      tags,
    };

    this.cache.set(key, entry);

    // Update tag index
    tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    });
  }

  async delete(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (entry) {
      // Remove from tag index
      entry.tags.forEach(tag => {
        this.tagIndex.get(tag)?.delete(key);
      });
      this.cache.delete(key);
      return true;
    }
    return false;
  }

  async deleteByTag(tag: string): Promise<number> {
    const keys = this.tagIndex.get(tag);
    if (!keys) return 0;

    let count = 0;
    keys.forEach(key => {
      if (this.delete(key)) count++;
    });

    this.tagIndex.delete(tag);
    return count;
  }

  async deleteByPattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let count = 0;

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        this.delete(key);
        count++;
      }
    });

    return count;
  }

  async flush(): Promise<void> {
    this.cache.clear();
    this.tagIndex.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      itemCount: this.cache.size,
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
    this.tagIndex.clear();
  }
}

// ============================================
// REDIS CACHE (Production)
// ============================================

class RedisCache {
  private client: any = null;
  private connected = false;
  private keyPrefix: string;
  private stats = { hits: 0, misses: 0 };

  constructor(private config: CacheConfig) {
    this.keyPrefix = config.keyPrefix || 'qgrid:';
  }

  async connect(): Promise<boolean> {
    try {
      // Dynamic import to avoid requiring Redis in development
      const { createClient } = await import('redis');

      this.client = createClient({
        socket: {
          host: this.config.host,
          port: this.config.port,
        },
        password: this.config.password,
        database: this.config.db,
      });

      this.client.on('error', (err: Error) => {
        console.error('Redis Client Error:', err.message);
        this.connected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis connected');
        this.connected = true;
      });

      await this.client.connect();
      this.connected = true;
      return true;
    } catch (error) {
      console.warn('Redis connection failed, using in-memory cache:', (error as Error).message);
      this.connected = false;
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected && this.client?.isOpen;
  }

  private prefixKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected()) return null;

    try {
      const data = await this.client.get(this.prefixKey(key));
      if (data) {
        this.stats.hits++;
        return JSON.parse(data) as T;
      }
      this.stats.misses++;
      return null;
    } catch (error) {
      console.error('Redis GET error:', error);
      this.stats.misses++;
      return null;
    }
  }

  async set<T>(key: string, data: T, ttlSeconds: number, tags: string[] = []): Promise<void> {
    if (!this.isConnected()) return;

    try {
      const prefixedKey = this.prefixKey(key);
      await this.client.setEx(prefixedKey, ttlSeconds, JSON.stringify(data));

      // Store tag associations
      for (const tag of tags) {
        await this.client.sAdd(this.prefixKey(`tag:${tag}`), prefixedKey);
        await this.client.expire(this.prefixKey(`tag:${tag}`), ttlSeconds * 2);
      }
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.isConnected()) return false;

    try {
      const result = await this.client.del(this.prefixKey(key));
      return result > 0;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async deleteByTag(tag: string): Promise<number> {
    if (!this.isConnected()) return 0;

    try {
      const tagKey = this.prefixKey(`tag:${tag}`);
      const keys = await this.client.sMembers(tagKey);

      if (keys.length === 0) return 0;

      const result = await this.client.del(keys);
      await this.client.del(tagKey);
      return result;
    } catch (error) {
      console.error('Redis deleteByTag error:', error);
      return 0;
    }
  }

  async deleteByPattern(pattern: string): Promise<number> {
    if (!this.isConnected()) return 0;

    try {
      const keys = await this.client.keys(this.prefixKey(pattern));
      if (keys.length === 0) return 0;
      return await this.client.del(keys);
    } catch (error) {
      console.error('Redis deleteByPattern error:', error);
      return 0;
    }
  }

  async flush(): Promise<void> {
    if (!this.isConnected()) return;

    try {
      const keys = await this.client.keys(this.prefixKey('*'));
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      this.stats = { hits: 0, misses: 0 };
    } catch (error) {
      console.error('Redis flush error:', error);
    }
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      itemCount: -1, // Redis doesn't easily expose this
    };
  }

  async disconnect(): Promise<void> {
    if (this.client?.isOpen) {
      await this.client.quit();
      this.connected = false;
    }
  }
}

// ============================================
// UNIFIED CACHE SERVICE
// ============================================

export class CacheService {
  private memoryCache: InMemoryCache;
  private redisCache: RedisCache | null = null;
  private useRedis = false;

  constructor(config?: Partial<CacheConfig>) {
    const redisConfig: CacheConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'qgrid:',
      defaultTTL: 300,
      maxMemoryItems: 10000,
      ...config,
    };

    this.memoryCache = new InMemoryCache(redisConfig.maxMemoryItems);

    // Only attempt Redis connection if enabled
    if (process.env.REDIS_ENABLED === 'true') {
      this.redisCache = new RedisCache(redisConfig);
    }
  }

  async initialize(): Promise<void> {
    if (this.redisCache) {
      this.useRedis = await this.redisCache.connect();
      if (this.useRedis) {
        console.log('Cache service initialized with Redis');
      } else {
        console.log('Cache service falling back to in-memory cache');
      }
    } else {
      console.log('Cache service initialized with in-memory cache');
    }
  }

  /**
   * Generate a cache key from components
   */
  static key(...parts: (string | number)[]): string {
    return parts.join(':');
  }

  /**
   * Generate a hash-based cache key for complex objects
   */
  static hashKey(prefix: string, obj: object): string {
    const hash = createHash('sha256')
      .update(JSON.stringify(obj))
      .digest('hex')
      .slice(0, 16);
    return `${prefix}:${hash}`;
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (this.useRedis && this.redisCache) {
      const result = await this.redisCache.get<T>(key);
      if (result !== null) return result;
    }
    return this.memoryCache.get<T>(key);
  }

  /**
   * Set a value in cache
   */
  async set<T>(key: string, data: T, ttlSeconds?: number, tags: string[] = []): Promise<void> {
    const ttl = ttlSeconds || CACHE_TTLS.TRANSACTION_HISTORY;

    // Always set in memory cache for fast access
    await this.memoryCache.set(key, data, ttl, tags);

    // Also set in Redis if available
    if (this.useRedis && this.redisCache) {
      await this.redisCache.set(key, data, ttl, tags);
    }
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds?: number,
    tags: string[] = []
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, ttlSeconds, tags);
    return data;
  }

  /**
   * Delete a specific key
   */
  async delete(key: string): Promise<boolean> {
    const memResult = await this.memoryCache.delete(key);
    let redisResult = false;

    if (this.useRedis && this.redisCache) {
      redisResult = await this.redisCache.delete(key);
    }

    return memResult || redisResult;
  }

  /**
   * Delete all keys with a specific tag
   */
  async invalidateByTag(tag: string): Promise<number> {
    let count = await this.memoryCache.deleteByTag(tag);

    if (this.useRedis && this.redisCache) {
      count += await this.redisCache.deleteByTag(tag);
    }

    return count;
  }

  /**
   * Delete all keys matching a pattern (e.g., "user:123:*")
   */
  async invalidateByPattern(pattern: string): Promise<number> {
    let count = await this.memoryCache.deleteByPattern(pattern);

    if (this.useRedis && this.redisCache) {
      count += await this.redisCache.deleteByPattern(pattern);
    }

    return count;
  }

  /**
   * Invalidate all user-related caches
   */
  async invalidateUser(userId: string): Promise<void> {
    await Promise.all([
      this.invalidateByPattern(`${CACHE_KEYS.TRANSACTIONS}:${userId}:*`),
      this.invalidateByPattern(`${CACHE_KEYS.RECENT_TX}:${userId}:*`),
      this.invalidateByPattern(`${CACHE_KEYS.USER_STATS}:${userId}:*`),
      this.invalidateByPattern(`${CACHE_KEYS.WALLET}:${userId}:*`),
      this.invalidateByPattern(`${CACHE_KEYS.FRAUD}:${userId}:*`),
    ]);
  }

  /**
   * Flush all caches
   */
  async flush(): Promise<void> {
    await this.memoryCache.flush();
    if (this.useRedis && this.redisCache) {
      await this.redisCache.flush();
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { memory: CacheStats; redis: CacheStats | null } {
    return {
      memory: this.memoryCache.getStats(),
      redis: this.useRedis && this.redisCache ? this.redisCache.getStats() : null,
    };
  }

  /**
   * Check if Redis is being used
   */
  isUsingRedis(): boolean {
    return this.useRedis;
  }

  /**
   * Cleanup and disconnect
   */
  async destroy(): Promise<void> {
    this.memoryCache.destroy();
    if (this.redisCache) {
      await this.redisCache.disconnect();
    }
  }
}

// Singleton instance
let cacheInstance: CacheService | null = null;

/**
 * Get the cache service singleton
 */
export function getCache(): CacheService {
  if (!cacheInstance) {
    cacheInstance = new CacheService();
  }
  return cacheInstance;
}

/**
 * Initialize the cache service (call once at startup)
 */
export async function initializeCache(): Promise<CacheService> {
  const cache = getCache();
  await cache.initialize();
  return cache;
}

// Export default instance getter
export default getCache;
