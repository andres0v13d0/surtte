import { Controller, Post, Body, UseGuards, Logger, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './dto/notification.dto';
import { RegisterFcmTokenDto } from './dto/register-token.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { Request } from 'express';

@Controller('notification')
@UseGuards(FirebaseAuthGuard)
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  async sendNotification(@Body() dto: SendNotificationDto) {
    const notification = await this.notificationService.sendNotification(dto);
    this.logger.log(`✅ Notificación creada y enviada con ID=${notification.id}`);
    return notification;
  }

  @Post('register-token')
  async registerFcmToken(@Body() dto: RegisterFcmTokenDto, @Req() req: Request) {
    const currentUser = req['userDB'];

    if (!currentUser || !currentUser.id) {
      throw new Error('Usuario no encontrado en la sesión');
    }

    await this.notificationService.registerFcmToken(currentUser.id, dto.fcmToken);
    this.logger.log(`✅ Token FCM registrado para el userId=${currentUser.id}`);
    return { message: 'Token registrado exitosamente' };
  }
}
