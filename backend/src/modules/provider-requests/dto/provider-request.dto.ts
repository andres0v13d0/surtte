import {
    IsString,
    IsOptional,
    IsEnum,
    IsBoolean,
    IsNotEmpty,
} from 'class-validator';

export enum EstadoSolicitud {
    PENDIENTE = 'pendiente',
    APROBADO = 'aprobado',
    RECHAZADO = 'rechazado',
}

export class ProviderRequestDto {
    @IsString()
    @IsNotEmpty()
    nombre_empresa: string;

    @IsString()
    @IsNotEmpty()
    archivoRUT: string; 

    @IsString()
    @IsNotEmpty()
    archivoCamaraComercio: string; 

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsString()
    numeroRUT?: string;

    @IsOptional()
    @IsString()
    numeroCamaraComercio?: string;

    @IsOptional()
    @IsEnum(EstadoSolicitud)
    estado?: EstadoSolicitud;

    @IsOptional()
    @IsBoolean()
    pagoRealizado?: boolean;
}
