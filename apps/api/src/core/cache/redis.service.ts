import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private isConnected: boolean = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || `redis://localhost:6379`;

    // ⚡ Performance: Enhanced Redis configuration with connection pooling
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      // Connection pool settings
      lazyConnect: false,
      keepAlive: 30000, // Keep connection alive for 30s
      retryStrategy: (times: number) => {
        // Exponential backoff: reconnect after delay
        const delay = Math.min(times * 100, 3000);
        this.logger.warn(`Redis reconnecting in ${delay}ms (attempt ${times})`);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetErrors = ['READONLY', 'ECONNREFUSED'];
        if (
          targetErrors.some((targetError) => err.message.includes(targetError))
        ) {
          // Reconnect on specific errors
          return true;
        }
        return false;
      },
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log(`✅ Connected to Redis: ${redisUrl}`);
    });

    this.client.on('ready', () => {
      this.logger.log('✅ Redis client ready');
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      this.logger.error('❌ Redis error:', err.message);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      this.logger.warn('⚠️ Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      this.logger.log('🔄 Redis reconnecting...');
    });
  }

  async get<T = any>(key: string): Promise<T | null> {
    // ⚡ Performance: Graceful degradation if Redis is down
    if (!this.isConnected) {
      this.logger.warn(`Redis not connected, cache miss for: ${key}`);
      return null;
    }

    try {
      const raw = await this.client.get(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch (e) {
        return raw as unknown as T;
      }
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error.message);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn(`Redis not connected, skipping cache set for: ${key}`);
      return;
    }

    try {
      const raw = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client.set(key, raw, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, raw);
      }
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error.message);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error.message);
    }
  }

  // ⚡ Performance: Delete multiple keys at once
  async delMany(keys: string[]): Promise<number> {
    if (!this.isConnected || keys.length === 0) return 0;

    try {
      return await this.client.del(...keys);
    } catch (error) {
      this.logger.error(`Error deleting multiple keys:`, error.message);
      return 0;
    }
  }

  // ⚡ Performance: Batch delete with pattern matching
  async delPattern(pattern: string): Promise<number> {
    if (!this.isConnected) return 0;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;

      // Delete in batches of 100
      const batchSize = 100;
      let deleted = 0;
      for (let i = 0; i < keys.length; i += batchSize) {
        const batch = keys.slice(i, i + batchSize);
        deleted += await this.client.del(...batch);
      }
      this.logger.log(`Deleted ${deleted} keys matching pattern: ${pattern}`);
      return deleted;
    } catch (error) {
      this.logger.error(`Error deleting pattern ${pattern}:`, error.message);
      return 0;
    }
  }

  // ⚡ Performance: Pipeline for batch operations (reduces RTT)
  async pipeline() {
    return this.client.pipeline();
  }

  // ⚡ Performance: Batch get multiple keys
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    if (!this.isConnected || keys.length === 0) return [];

    try {
      const values = await this.client.mget(keys);
      return values.map((v) => {
        if (!v) return null;
        try {
          return JSON.parse(v) as T;
        } catch {
          return v as unknown as T;
        }
      });
    } catch (error) {
      this.logger.error(`Error getting multiple keys:`, error.message);
      return keys.map(() => null);
    }
  }

  // ⚡ Performance: Batch set multiple keys with pipeline
  async mset(
    entries: Array<{ key: string; value: unknown; ttl?: number }>,
  ): Promise<void> {
    if (!this.isConnected || entries.length === 0) return;

    try {
      const pipeline = this.client.pipeline();

      for (const { key, value, ttl } of entries) {
        const raw = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttl && ttl > 0) {
          pipeline.set(key, raw, 'EX', ttl);
        } else {
          pipeline.set(key, raw);
        }
      }

      await pipeline.exec();
    } catch (error) {
      this.logger.error(`Error setting multiple keys:`, error.message);
    }
  }

  // Increment a numeric key
  async incr(key: string): Promise<number> {
    if (!this.isConnected) return 0;
    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}:`, error.message);
      return 0;
    }
  }

  // Hash operations for simple metrics
  async hincrby(hash: string, field: string, by = 1): Promise<number> {
    if (!this.isConnected) return 0;
    try {
      return await this.client.hincrby(hash, field, by);
    } catch (error) {
      this.logger.error(
        `Error incrementing hash ${hash} field ${field}:`,
        error.message,
      );
      return 0;
    }
  }

  async hset(hash: string, field: string, value: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.hset(hash, field, value);
    } catch (error) {
      this.logger.error(
        `Error setting hash ${hash} field ${field}:`,
        error.message,
      );
    }
  }

  async hget(hash: string, field: string): Promise<string | null> {
    if (!this.isConnected) return null;
    try {
      return await this.client.hget(hash, field);
    } catch (error) {
      this.logger.error(
        `Error getting hash ${hash} field ${field}:`,
        error.message,
      );
      return null;
    }
  }

  // ⚡ Performance: Batch hash increment with pipeline
  async hincrbyBatch(
    operations: Array<{ hash: string; field: string; by?: number }>,
  ): Promise<void> {
    if (!this.isConnected || operations.length === 0) return;

    try {
      const pipeline = this.client.pipeline();
      for (const { hash, field, by = 1 } of operations) {
        pipeline.hincrby(hash, field, by);
      }
      await pipeline.exec();
    } catch (error) {
      this.logger.error(`Error in batch hash increment:`, error.message);
    }
  }

  // ⚡ Performance: Check connection health
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }

  // Get connection status
  getConnectionStatus(): { connected: boolean; ready: boolean } {
    return {
      connected: this.isConnected,
      ready: this.client.status === 'ready',
    };
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
      this.logger.log('🔌 Redis connection closed gracefully');
    } catch (e) {
      this.logger.warn('Error closing Redis client', e);
    }
  }
}
