import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';

import { Provider } from '../../providers/entity/provider.entity';
import { Plan } from '../../plans/entity/plan.entity';
import { Payment } from '../../payments/entity/payment.entity';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

@Entity('subscriptions')
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Provider, { eager: true })
    @JoinColumn({ name: 'provider_id' })
    provider: Provider;

    @ManyToOne(() => Plan, { eager: true })
    @JoinColumn({ name: 'plan_id' })
    plan: Plan;

    @ManyToOne(() => Payment, { eager: true })
    @JoinColumn({ name: 'payment_id' })
    payment: Payment;

    @Column({ type: 'enum', enum: ['active', 'expired', 'cancelled'], default: 'active' })
    status: SubscriptionStatus;

    @Column({ type: 'timestamp' })
    startDate: Date;

    @Column({ type: 'timestamp' })
    endDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
