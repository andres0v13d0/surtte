import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Module({
  providers: [WhatsappService],
  exports: [WhatsappService], // Para poder usarlo en notifications.service.ts
})
export class WhatsappModule {}
