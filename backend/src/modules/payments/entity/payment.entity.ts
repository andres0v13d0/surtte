import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';
import { Plan } from '../../plans/entity/plan.entity';
import { Provider } from '../../providers/entity/provider.entity';

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Provider, { eager: true })
    @JoinColumn({ name: 'provider_id' })
    provider: Provider;

    @ManyToOne(() => Plan, { eager: true })
    @JoinColumn({ name: 'plan_id' })
    plan: Plan;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected'], default: 'pending' })
    status: PaymentStatus;

    @Column({ name: 'mercado_pago_id', nullable: true })
    mercadoPagoId: string;

    @Column({ name: 'external_reference', nullable: true })
    externalReference: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
