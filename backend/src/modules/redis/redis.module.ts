import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';
import { RedisTestService } from './redis-test.service';

@Module({
  imports: [ConfigModule],
  providers: [RedisService, RedisTestService],
  exports: [RedisService],
})
export class RedisModule {}