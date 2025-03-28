import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Provider } from '../../providers/entity/provider.entity';
 
export enum RolUsuario {
    ADMIN = 'admin',
    VERIFICADOR = 'verificador',
    MODERADOR = 'moderador',
    SOPORTE = 'soporte',
    PROVEEDOR = 'proveedor',
    COMERCIANTE = 'comerciante',
}
  

@Entity('usuarios')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    firebaseUid: string;

    @Column()
    nombre: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    telefono: string;

    @Column({
        type: 'enum',
        enum: RolUsuario,
        default: RolUsuario.COMERCIANTE,
    })
    rol: RolUsuario;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaRegistro: Date;

    @OneToOne(() => Provider, (provider) => provider.usuario)
    proveedorInfo: Provider;
}
