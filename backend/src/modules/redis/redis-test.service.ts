import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RedisTestService implements OnModuleInit {
  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    try {
      console.log('🔵 Test Redis: iniciando prueba de conexión...');
      const pong = await this.redisService.getRawClient().ping();
      console.log('✅ Redis respondió:', pong);

      const testKey = 'surtte:test:key';
      const testValue = 'Hola desde SURTTE Redis';

      await this.redisService.getRawClient().set(testKey, testValue);
      const value = await this.redisService.getRawClient().get(testKey);

      console.log(`🎯 Redis Key [${testKey}] tiene el valor:`, value);
    } catch (error) {
      console.error('❌ Error probando Redis:', error);
    }
  }
}
