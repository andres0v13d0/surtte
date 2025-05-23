import {
    IsEnum,
    IsString,
    IsOptional,
    IsPhoneNumber,
    IsEmail,
    IsObject,
    ValidateIf,
} from 'class-validator';
import { NotificationChannel, NotificationPurpose } from '../entities/notification-log.entity';

export class SendNotificationDto {
    @IsEnum(NotificationChannel)
    channel: NotificationChannel;

    @IsEnum(NotificationPurpose)
    purpose: NotificationPurpose;

    @ValidateIf((o) => o.channel === NotificationChannel.EMAIL)
    @IsEmail()
    email?: string;

    @ValidateIf((o) => o.channel === NotificationChannel.WHATSAPP)
    @IsPhoneNumber('CO')
    phoneNumber?: string;

    @IsObject()
    data: Record<string, any>; // Parámetros que llenarán los templates
}
