import {
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreatePlanDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre del plan es obligatorio.' })
    @MaxLength(50, { message: 'Máximo 50 caracteres para el nombre.' })
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(300, { message: 'Máximo 300 caracteres para la descripción.' })
    description?: string;

    @IsPositive({ message: 'El precio debe ser un número positivo.' })
    price: number;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    features?: string[];
    }

    export class UpdatePlanDto {
    @IsString()
    @IsOptional()
    @MaxLength(50)
    name?: string;

    @IsString()
    @IsOptional()
    @MaxLength(300)
    description?: string;

    @IsPositive()
    @IsOptional()
    price?: number;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    features?: string[];
}