import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty({ message: 'El ID del plan es obligatorio.' })
  planId: string;

  @IsPositive({ message: 'El monto debe ser mayor que cero.' })
  amount: number;

  @IsOptional()
  @IsString()
  externalReference?: string;
}

export enum PaymentStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PENDING = 'pending',
}

export class UpdatePaymentStatusDto {
  @IsUUID()
  @IsNotEmpty({ message: 'El ID del pago es obligatorio.' })
  paymentId: string;

  @IsEnum(PaymentStatus, {
    message: 'El estado del pago debe ser: approved, rejected o pending.',
  })
  status: PaymentStatus;

  @IsString()
  @IsNotEmpty({ message: 'Se requiere el ID de Mercado Pago.' })
  mercadoPagoId: string;
}
