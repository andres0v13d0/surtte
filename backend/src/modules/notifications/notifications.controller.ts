import {
    Controller,
    Post,
    Body,
    HttpCode,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

import { SendVerificationDto } from './dto/send-verification.dto';
import { ConfirmVerificationDto } from './dto/confirm-verification.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { SendNotificationDto } from './dto/send-notification.dto';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    // 🔐 Enviar código de verificación
    @Post('verify')
    async sendVerification(@Body() dto: SendVerificationDto) {
        return this.notificationsService.sendVerification(dto);
    }

    // 🔁 Reenviar código
    @Post('verify/resend')
    async resendVerification(@Body() dto: ResendVerificationDto) {
        return this.notificationsService.resendVerification(dto);
    }

    // ✅ Confirmar código
    @Post('verify/confirm')
    async confirmVerification(@Body() dto: ConfirmVerificationDto) {
        return this.notificationsService.confirmVerification(dto);
    }

    // 📢 Notificación común (pedido, plan, etc.)
    @Post()
    @HttpCode(200)
    async sendNotification(@Body() dto: SendNotificationDto) {
        return this.notificationsService.sendNotification(dto);
    }
}
