import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

export const PREDIS_PROVIDER_NAME = 'REDIS_CLIENT'

@Global()
@Module({
  providers: [
    {
      provide: PREDIS_PROVIDER_NAME,
      useFactory: async (configService: ConfigService) => {
        const url = configService.get<string>('redis.url');
        const client = createClient({ url });

        client.on('error', (err) => {
          console.error('❌ Redis connection error:', err);
        });

        await client.connect();
        console.log('✅ Redis connected:', url);

        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
