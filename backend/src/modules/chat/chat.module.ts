import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from './entity/chat.entity';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { RedisModule } from '../redis/redis.module';
import { NotificationModule } from '../notification/notification.module';
import { UsersModule } from '../users/users.module';
import { ChatController } from './chat.controller';
import { User } from '../users/entity/user.entity';
import { Provider } from '../providers/entity/provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatEntity, User, Provider]),
    RedisModule,
    NotificationModule,
    UsersModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
