import {
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { Type } from 'class-transformer';


export class CreateCustomerDto {
    @IsNumber()
    userId: number;

    @IsNumber()
    providerId: number;
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
    isExclusive: boolean;
}

export class CustomerResponseDto {
    @IsNumber()
    id: number;

    @IsNumber()
    userId: number;

    @IsString()
    userName: string;

    @IsString()
    userEmail: string;

    @IsString()
    userTelefono: string;

    @IsString()
    createdAt: string;

    @IsOptional()
    isExclusive: boolean;
}
