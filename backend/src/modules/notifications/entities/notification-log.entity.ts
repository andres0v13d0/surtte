import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

export enum NotificationChannel {
    EMAIL = 'email',
    WHATSAPP = 'whatsapp',
}

export enum NotificationPurpose {
    VERIFY_EMAIL = 'verify_email',
    VERIFY_PHONE = 'verify_phone',
    NEW_ORDER = 'new_order',
    ORDER_CONFIRMED = 'order_confirmed',
    PLAN_PURCHASE = 'plan_purchase',
    // Agrega aquí otros propósitos según crezca SURTTE
}

@Entity('notification_logs')
export class NotificationLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: NotificationChannel })
    channel: NotificationChannel;

    @Column({ type: 'enum', enum: NotificationPurpose })
    purpose: NotificationPurpose;

    @Column({ type: 'varchar', length: 150, nullable: true })
    @Index()
    destination: string; // email o celular

    @Column({ type: 'boolean', default: false })
    success: boolean;

    @Column({ type: 'text', nullable: true })
    responseDetails?: string; // Por si WhatsApp o el SMTP devuelve un resultado

    @CreateDateColumn()
    createdAt: Date;
}
