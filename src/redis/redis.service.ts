import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    constructor(
        @Inject('REDIS_CLIENT') private readonly client: Redis,
    ) { }

    async set(key: string, value: any, ttlSeconds?: number) {
        const payload = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttlSeconds) {
            await this.client.set(key, payload, 'EX', ttlSeconds);
        } else {
            await this.client.set(key, payload);
        }
    }

    async get<T = any>(key: string): Promise<T | null> {
        const data = await this.client.get(key);
        if (!data) return null;

        try {
            return JSON.parse(data) as T;
        } catch {
            return data as unknown as T;
        }
    }

    async del(key: string) {
        await this.client.del(key);
    }
}
