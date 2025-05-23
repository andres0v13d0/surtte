import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import { Customer } from 'src/modules/customers/entity/customer.entity';

export type EstadoVerificacion = 'pendiente' | 'en_revision' | 'verificado' | 'rechazado';

@Entity('proveedores')
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ type: 'varchar', length: 255 })
  nombre_empresa: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rut: string;

  @Column({ type: 'text', nullable: true })
  camara_comercio: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  @Column({ default: 'pendiente' })
  estadoVerificacion: EstadoVerificacion;

  @Column({ default: true })
  pagoVerificacion: boolean;

  @Column({ default: true })
  documentosCompletos: boolean;

  @Column({ type: 'float', default: 5 })
  calificacion: number;

  @Column({ type: 'int', default: 100 })
  cantidadPedidos: number;

  @Column({ default: true })
  proveedorConfiable: boolean;

  @OneToMany(() => Order, (order) => order.provider)
  orders: Order[];

  @OneToMany(() => Customer, (customer) => customer.provider)
  customers: Customer[];

}
