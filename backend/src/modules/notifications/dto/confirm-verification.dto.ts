import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsPhoneNumber,
    IsString,
    Length,
    ValidateIf,
} from 'class-validator';
import { VerificationChannel, VerificationType } from '../entities/verification-code.entity';

export class ConfirmVerificationDto {
    @IsEnum(VerificationChannel)
    channel: VerificationChannel;

    @IsEnum(VerificationType)
    type: VerificationType;

    @ValidateIf((o) => o.channel === VerificationChannel.EMAIL)
    @IsEmail()
    email?: string;

    @ValidateIf((o) => o.channel === VerificationChannel.WHATSAPP)
    @IsPhoneNumber('CO')
    phoneNumber?: string;

    @IsString()
    @Length(6, 6)
    code: string;
}
