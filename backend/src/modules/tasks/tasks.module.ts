import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from '../chat/entity/chat.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SubscriptionsModule,      
    TypeOrmModule.forFeature([ChatEntity]), 
  ],
  providers: [TasksService],
})
export class TasksModule {}
