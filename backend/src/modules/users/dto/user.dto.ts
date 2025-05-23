import { IsString, IsEmail, IsOptional, IsIn } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { RolUsuario } from '../entity/user.entity';

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
    @IsIn(Object.values(RolUsuario))
    rol?: RolUsuario;
}


export class CompleteProfileDto {
    @IsString()
    nombre: string;

    @IsString()
    telefono: string;

    @IsString()
    departamento: string;

    @IsString()
    ciudad: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) { }