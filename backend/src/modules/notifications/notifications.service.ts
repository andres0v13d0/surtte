import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VerificationCode, VerificationChannel, VerificationType } from './entities/verification-code.entity';
import { NotificationLog, NotificationChannel, NotificationPurpose } from './entities/notification-log.entity';

import { SendVerificationDto } from './dto/send-verification.dto';
import { ConfirmVerificationDto } from './dto/confirm-verification.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { SendNotificationDto } from './dto/send-notification.dto';

import { EmailService } from './email/email.service';
import { WhatsappService } from './whatsapp/whatsapp.service';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(VerificationCode)
        private verificationRepo: Repository<VerificationCode>,

        @InjectRepository(NotificationLog)
        private logRepo: Repository<NotificationLog>,

        private emailService: EmailService,
        private whatsappService: WhatsappService,
    ) { }

    // 🔐 ENVÍO DE CÓDIGO DE VERIFICACIÓN
    async sendVerification(dto: SendVerificationDto) {
        const { channel, type, email, phoneNumber } = dto;

        const destination = channel === VerificationChannel.EMAIL ? email : phoneNumber;

        if (!destination) throw new BadRequestException('Destino requerido');

        // Borrar códigos anteriores no confirmados
        await this.verificationRepo.delete({ channel, type, email, phoneNumber, isConfirmed: false });

        // Generar código de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

        const entity = this.verificationRepo.create({
            channel,
            type,
            email,
            phoneNumber,
            code,
            expiresAt,
        });

        await this.verificationRepo.save(entity);

        const success = await this.sendByChannel(channel, {
            destination,
            purpose: type === VerificationType.VERIFY_EMAIL ? NotificationPurpose.VERIFY_EMAIL : NotificationPurpose.VERIFY_PHONE,
            data: { code },
        });

        return { message: 'Código enviado', code: success ? code : undefined };
    }

    // 🔁 REENVÍO DE CÓDIGO (si no ha expirado)
    async resendVerification(dto: ResendVerificationDto) {
        const { channel, type, email, phoneNumber } = dto;

        const existing = await this.verificationRepo.findOne({
            where: {
                channel,
                type,
                email,
                phoneNumber,
                isConfirmed: false,
            },
        });

        if (!existing || existing.expiresAt < new Date()) {
            return this.sendVerification(dto); // Se genera uno nuevo
        }

        const destination = channel === VerificationChannel.EMAIL ? email : phoneNumber;

        const success = await this.sendByChannel(channel, {
            destination,
            purpose: type === VerificationType.VERIFY_EMAIL ? NotificationPurpose.VERIFY_EMAIL : NotificationPurpose.VERIFY_PHONE,
            data: { code: existing.code },
        });

        return { message: 'Código reenviado', code: success ? existing.code : undefined };
    }

    // ✅ CONFIRMAR CÓDIGO
    async confirmVerification(dto: ConfirmVerificationDto) {
        const { channel, type, email, phoneNumber, code } = dto;

        const record = await this.verificationRepo.findOne({
            where: { channel, type, email, phoneNumber, code, isConfirmed: false },
        });

        if (!record) throw new NotFoundException('Código incorrecto o expirado');

        if (record.expiresAt < new Date()) {
            await this.verificationRepo.delete(record.id);
            throw new BadRequestException('Código expirado');
        }

        record.isConfirmed = true;
        await this.verificationRepo.save(record);

        return { message: 'Verificación exitosa' };
    }

    // 📢 NOTIFICACIÓN NORMAL (pedido, plan, etc.)
    async sendNotification(dto: SendNotificationDto) {
        const { channel, purpose, email, phoneNumber, data } = dto;

        const destination = channel === NotificationChannel.EMAIL ? email : phoneNumber;

        if (!destination) throw new BadRequestException('Destino requerido');

        const success = await this.sendByChannel(channel, {
            destination,
            purpose,
            data,
        });

        return { message: 'Notificación enviada', success };
    }

    // ⚙️ ENVIAR POR CANAL
    private async sendByChannel(
        channel: NotificationChannel | VerificationChannel,
        {
            destination,
            purpose,
            data,
        }: {
            destination: string;
            purpose: NotificationPurpose;
            data: Record<string, any>;
        },
    ): Promise<boolean> {
        let result: { success: boolean; responseDetails?: any };

        if (channel === NotificationChannel.EMAIL || channel === VerificationChannel.EMAIL) {
            result = await this.emailService.send(purpose, destination, data);
        } else if (channel === NotificationChannel.WHATSAPP || channel === VerificationChannel.WHATSAPP) {
            result = await this.whatsappService.send(purpose, destination, data);
        } else {
            throw new BadRequestException('Canal no soportado');
        }

        // Registrar en logs
        await this.logRepo.save(
            this.logRepo.create({
                channel: channel as NotificationChannel,
                purpose,
                destination,
                success: result.success,
                responseDetails: result.responseDetails || null,
            }),
        );

        return result.success;
    }
}
