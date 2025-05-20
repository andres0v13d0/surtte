import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustomerDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsNumber()
  providerId: number;

  @IsString()
  nombre: string;

  @IsString()
  celular: string;

  @IsString()
  direccion: string;

  @IsString()
  ciudad: string;

  @IsString()
  departamento: string;
}

export class FilterCustomersDto {
  @IsOptional()
  @IsString()
  searchName?: string;

  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  isExclusive?: boolean;
}

export class CustomerResponseDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsString()
  nombre: string;

  @IsString()
  celular: string;

  @IsString()
  direccion: string;

  @IsString()
  ciudad: string;

  @IsString()
  departamento: string;

  @IsString()
  createdAt: string;

  @IsOptional()
  isExclusive: boolean;
}
