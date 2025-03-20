import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entity/user.entity';

@Entity('proveedores')
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { cascade: true, onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ type: 'varchar', length: 255 })
  nombre_empresa: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  rut: string;

  @Column({ type: 'text' })
  camara_comercio: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;
}

