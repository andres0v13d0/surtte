import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { ProviderRequest } from './entity/provider-request.entity';
import { Provider } from '../providers/entity/provider.entity';
import { User, RolUsuario } from '../users/entity/user.entity';
import { ProviderRequestDto, EstadoSolicitud } from './dto/provider-request.dto';

@Injectable()
export class ProviderRequestsService {
    private readonly bucketName = 'surtte-provider-requests';
    private readonly region = 'us-east-2';
    private readonly cloudFrontUrl = 'https://cdn.surtte.com';
    private readonly folder = 'solicitudes';

    private readonly s3 = new S3Client({ region: this.region });

    constructor(
        @InjectRepository(ProviderRequest)
        private readonly requestRepo: Repository<ProviderRequest>,

        @InjectRepository(Provider)
        private readonly providerRepo: Repository<Provider>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {}

    async generateSignedUrl(mimeType: string, filename: string): Promise<{ signedUrl: string; finalUrl: string }> {
        const extension = filename.split('.').pop();
        const key = `${this.folder}/${uuidv4()}.${extension}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: mimeType,
        });

        const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
        const finalUrl = `${this.cloudFrontUrl}/${key}`;
        return { signedUrl, finalUrl };
    }

    async createRequest(dto: ProviderRequestDto, usuario: User): Promise<ProviderRequest> {
        const solicitud = this.requestRepo.create({
            usuario,
            nombre_empresa: dto.nombre_empresa,
            descripcion: dto.descripcion,
            archivoRUT: dto.archivoRUT,
            archivoCamaraComercio: dto.archivoCamaraComercio,
        });

        return this.requestRepo.save(solicitud);
    }

    async revisarSolicitud(id: number, dto: ProviderRequestDto): Promise<ProviderRequest> {
        const solicitud = await this.requestRepo.findOne({
            where: { id },
            relations: ['usuario'],
        });
        if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

        solicitud.numeroRUT = dto.numeroRUT;
        solicitud.numeroCamaraComercio = dto.numeroCamaraComercio;
        solicitud.estado = dto.estado;

        if (solicitud.archivoRUT) {
            await this.borrarArchivoDeS3(solicitud.archivoRUT);
            solicitud.archivoRUT = null;
          }
        
        if (solicitud.archivoCamaraComercio) {
            await this.borrarArchivoDeS3(solicitud.archivoCamaraComercio);
            solicitud.archivoCamaraComercio = null;
        }

        solicitud.archivoRUT = null;
        solicitud.archivoCamaraComercio = null;

        return this.requestRepo.save(solicitud);
    }

    async marcarPagoYConvertir(id: number): Promise<void> {
        const solicitud = await this.requestRepo.findOne({
            where: { id },
            relations: ['usuario'],
        });

        if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
        if (solicitud.estado !== 'aprobado') throw new BadRequestException('La solicitud no ha sido aprobada');
        if (solicitud.pagoRealizado) throw new BadRequestException('El pago ya fue registrado');

        solicitud.pagoRealizado = true;
        await this.requestRepo.save(solicitud);

        const nuevoProveedor = this.providerRepo.create({
            usuario: solicitud.usuario,
            nombre_empresa: solicitud.nombre_empresa,
            descripcion: solicitud.descripcion,
            rut: solicitud.numeroRUT,
            camara_comercio: solicitud.numeroCamaraComercio,
        });

        solicitud.usuario.rol = RolUsuario.PROVEEDOR;

        await this.userRepo.save(solicitud.usuario);
        await this.providerRepo.save(nuevoProveedor);
    }

    private async borrarArchivoDeS3(url: string) {
        if (!url || typeof url !== 'string') return;
      
        const key = url.replace(`${this.cloudFrontUrl}/`, '');
      
        const command = new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        });
      
        try {
          await this.s3.send(command);
        } catch (err) {
          console.error(`Error al borrar archivo de S3: ${key}`, err);
        }
    }


    async findAll(): Promise<ProviderRequest[]> {
        return this.requestRepo.find({
            relations: ['usuario'],
            order: { fechaSolicitud: 'DESC' },
        });
    }

}
