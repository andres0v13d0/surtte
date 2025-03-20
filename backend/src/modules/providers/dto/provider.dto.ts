import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

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
}

export class UpdateProviderDto extends PartialType(CreateProviderDto) {}

