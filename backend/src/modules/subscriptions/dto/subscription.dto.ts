import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { SubscriptionStatus } from '../entity/subscription.entity';

export class CreateSubscriptionDto {
  @IsNumber()
  @IsNotEmpty({ message: 'El ID del proveedor es obligatorio.' })
  providerId: number;

  @IsUUID()
  @IsNotEmpty({ message: 'El ID del plan es obligatorio.' })
  planId: string;

  @IsUUID()
  @IsNotEmpty({ message: 'El ID del pago es obligatorio.' })
  paymentId: string;

  @IsDateString()
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria.' })
  startDate: string;

  @IsDateString()
  @IsNotEmpty({ message: 'La fecha de finalización es obligatoria.' })
  endDate: string;
}

export class UpdateSubscriptionDto {
  @IsEnum(['active', 'expired', 'cancelled'], {
    message: 'El estado debe ser: active, expired o cancelled.',
  })
  @IsOptional()
  status?: SubscriptionStatus;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
