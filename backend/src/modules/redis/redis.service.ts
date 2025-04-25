import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';
import { SetRedisDto, GetRedisDto, DelRedisDto, LPushRedisDto, LRangeRedisDto } from './dto/redis.dto';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: RedisClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
      reconnectOnError: () => true,
      lazyConnect: false,
    });

    this.client.on('connect', () => console.log('[RedisService] Connected to Redis'));
    this.client.on('error', (err) => console.error('[RedisService] Redis error', err));
  }

  async set({ key, value, ttl }: SetRedisDto): Promise<'OK'> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      return this.client.set(key, serialized, 'EX', ttl);
    }
    return this.client.set(key, serialized);
  }

  async get<T = any>({ key }: GetRedisDto): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  }

  async del({ key }: DelRedisDto): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async lpush({ key, value }: LPushRedisDto): Promise<number> {
    const serialized = JSON.stringify(value);
    return this.client.lpush(key, serialized);
  }

  async lrange<T = any>({ key, start, end }: LRangeRedisDto): Promise<T[]> {
    const data = await this.client.lrange(key, start, end);
    return data.map((item) => JSON.parse(item));
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getRawClient(): RedisClient {
    return this.client;
  }
}
