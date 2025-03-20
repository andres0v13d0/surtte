import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Provider } from '../../providers/entity/provider.entity';

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

    @Column({ default: false })
    proveedor: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaRegistro: Date;

    @OneToOne(() => Provider, (provider) => provider.usuario)
    proveedorInfo: Provider;
}
