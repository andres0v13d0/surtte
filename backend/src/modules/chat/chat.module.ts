import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from './entity/chat.entity';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { RedisModule } from '../redis/redis.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatEntity]),
    RedisModule,
    NotificationModule,
  ],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
