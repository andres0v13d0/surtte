import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  providers: [EmailService],
  exports: [EmailService], // Para que pueda usarse en notifications.service.ts
})
export class EmailModule {}
