import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
          throw new Error('REDIS_URL is not set in environment variables');
        }

        return new Redis(redisUrl, {
          tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
