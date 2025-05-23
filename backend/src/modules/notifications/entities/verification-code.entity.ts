import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';

export enum VerificationChannel {
    EMAIL = 'email',
    WHATSAPP = 'whatsapp',
}

export enum VerificationType {
    VERIFY_EMAIL = 'verify_email',
    VERIFY_PHONE = 'verify_phone',
}

@Entity('verification_codes')
export class VerificationCode {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    @Index()
    email?: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    @Index()
    phoneNumber?: string;

    @Column({ type: 'varchar', length: 6 })
    code: string;

    @Column({ type: 'enum', enum: VerificationChannel })
    channel: VerificationChannel;

    @Column({ type: 'enum', enum: VerificationType })
    type: VerificationType;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column({ default: false })
    isConfirmed: boolean;
}
