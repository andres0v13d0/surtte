import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity, NotificationStatus } from './entity/notification.entity';
import { SendNotificationDto } from './dto/notification.dto';
import { RedisService } from '../redis/redis.service';
import { admin } from '../../firebase/firebase-admin'; 

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
    private readonly redisService: RedisService,
  ) {}

  async sendNotification(dto: SendNotificationDto, sentByAdminId?: number): Promise<NotificationEntity> {
    const notification = this.notificationRepo.create({
      title: dto.title,
      body: dto.body,
      data: dto.data,
      userId: dto.userId,
      sentByAdminId,
      status: NotificationStatus.PENDING,
    });

    await this.notificationRepo.save(notification);

    try {
      if (dto.userId) {
        await this.sendToSingleUser(dto.userId, dto.title, dto.body, dto.data);
      } else {
        await this.sendToAllUsers(dto.title, dto.body, dto.data);
      }

      notification.status = NotificationStatus.SENT;
      await this.notificationRepo.save(notification);

      this.logger.log(`✅ Notificación enviada [${notification.id}]`);
    } catch (error) {
      this.logger.error(`❌ Error enviando notificación [${notification.id}]: ${error.message}`);
      notification.status = NotificationStatus.FAILED;
      await this.notificationRepo.save(notification);
      throw new InternalServerErrorException('Error al enviar la notificación');
    }

    return notification;
  }

  private async sendToSingleUser(userId: number, title: string, body: string, data?: Record<string, any>) {
    const token = await this.getFcmTokenFromUserId(userId);

    if (!token) {
      throw new NotFoundException('No se encontró token FCM para el usuario.');
    }

    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: data ? this.stringifyData(data) : {},
    };

    await admin.messaging().send(message);
  }

  private async sendToAllUsers(title: string, body: string, data?: Record<string, any>) {
    const topic = 'general'; 

    const message = {
      topic,
      notification: {
        title,
        body,
      },
      data: data ? this.stringifyData(data) : {},
    };

    await admin.messaging().send(message);
  }

  async registerFcmToken(userId: number, fcmToken: string): Promise<void> {
    await this.redisService.set({
      key: `user:${userId}:fcmToken`,
      value: fcmToken,
      ttl: 60 * 60 * 24 * 30, 
    });
    this.logger.log(`🎯 Token FCM registrado para userId=${userId}`);
  }

  private async getFcmTokenFromUserId(userId: number): Promise<string | null> {
    const token = await this.redisService.get<string>({ key: `user:${userId}:fcmToken` });
    return token;
  }

  private stringifyData(data: Record<string, any>): Record<string, string> {
    const stringifiedData: Record<string, string> = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        stringifiedData[key] = String(data[key]);
      }
    }
    return stringifiedData;
  }
}
