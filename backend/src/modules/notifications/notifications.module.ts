import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { EmailModule } from './email/email.module';
import { VerificationCode } from './entities/verification-code.entity';
import { NotificationLog } from './entities/notification-log.entity';
import { VerificationCleanerJob } from './cron/verification-cleaner.job';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationCode, NotificationLog]),
    WhatsappModule,
    EmailModule,
  ],
  providers: [NotificationsService, VerificationCleanerJob],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
