import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entity/notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { RedisModule } from '../redis/redis.module'; 
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    RedisModule,
    UsersModule
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
