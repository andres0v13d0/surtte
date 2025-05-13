import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entity/user.entity';

export type EstadoSolicitud = 'pendiente' | 'aprobado' | 'rechazado';

@Entity('solicitudes_proveedor')
export class ProviderRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'usuario_id' })
    usuario: User;

    @Column({ type: 'varchar', length: 255 })
    nombre_empresa: string;

    @Column({ type: 'text' })
    archivoRUT: string; // URL temporal en S3

    @Column({ type: 'text' })
    archivoCamaraComercio: string; // URL temporal en S3

    @Column({ type: 'varchar', length: 50, nullable: true })
    numeroRUT: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    numeroCamaraComercio: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ type: 'varchar', default: 'pendiente' })
    estado: EstadoSolicitud;

    @Column({ default: false })
    pagoRealizado: boolean;

    @CreateDateColumn()
    fechaSolicitud: Date;
}
