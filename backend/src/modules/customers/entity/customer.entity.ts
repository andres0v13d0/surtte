import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Column,
} from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Provider } from '../../providers/entity/provider.entity';

@Entity('customers')
@Unique(['user', 'provider'])
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.customers, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @ManyToOne(() => Provider, (provider) => provider.customers, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column()
  nombre: string;

  @Column()
  celular: string;

  @Column()
  direccion: string;

  @Column()
  ciudad: string;

  @Column()
  departamento: string;

  @Column({ default: false })
  isExclusive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
