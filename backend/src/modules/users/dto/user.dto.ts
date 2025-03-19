import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
    @IsString()
    firebaseUid: string;

    @IsString()
    nombre: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    @IsOptional()
    @IsBoolean()
    proveedor?: boolean;
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    @IsOptional()
    @IsBoolean()
    proveedor?: boolean;
}
