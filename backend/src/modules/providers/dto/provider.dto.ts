import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsIn, IsInt, IsPositive } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { EstadoVerificacion } from '../entity/provider.entity';

export class CreateProviderDto {
  @IsNumber()
  @IsNotEmpty()
  usuario_id: number;

  @IsString()
  @IsNotEmpty()
  nombre_empresa: string;

  @IsString()
  @IsNotEmpty()
  rut: string;

  @IsString()
  @IsNotEmpty()
  camara_comercio: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsOptional()
  @IsIn(['pendiente', 'en_revision', 'verificado', 'rechazado'])
  estadoVerificacion?: EstadoVerificacion;

  @IsOptional()
  @IsBoolean()
  pagoVerificacion?: boolean;

  @IsOptional()
  @IsBoolean()
  documentosCompletos?: boolean;

  @IsOptional()
  @IsPositive()
  calificacion?: number;

  @IsOptional()
  @IsInt()
  cantidadPedidos?: number;

  @IsOptional()
  @IsBoolean()
  proveedorConfiable?: boolean;
}

export class UpdateProviderDto extends PartialType(CreateProviderDto) {}

