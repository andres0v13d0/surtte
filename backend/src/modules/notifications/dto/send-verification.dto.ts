import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsPhoneNumber,
    IsString,
    ValidateIf,
} from 'class-validator';
import { VerificationChannel, VerificationType } from '../entities/verification-code.entity';

export class SendVerificationDto {
    @IsEnum(VerificationChannel)
    channel: VerificationChannel;

    @IsEnum(VerificationType)
    type: VerificationType;

    @ValidateIf((o) => o.channel === VerificationChannel.EMAIL)
    @IsEmail()
    email?: string;

    @ValidateIf((o) => o.channel === VerificationChannel.WHATSAPP)
    @IsPhoneNumber('ZZ') // Cambia el país si lo necesitas
    phoneNumber?: string;
}
