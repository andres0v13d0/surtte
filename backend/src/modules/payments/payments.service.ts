import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entity/payment.entity';
import { CreatePaymentDto, UpdatePaymentStatusDto } from './dto/payment.dto';
import { MercadoPagoService } from './mercado-pago/mercado-pago.service';
import { ProvidersService } from '../providers/providers.service';
import { PlansService } from '../plans/plans.service';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        private readonly mercadoPagoService: MercadoPagoService,
        private readonly providersService: ProvidersService,
        private readonly plansService: PlansService,
    ) {}

    async create(dto: CreatePaymentDto): Promise<{
        init_point: string;
        mercadoPagoId: string;
        paymentId: string;
    }> {
        const provider = await this.providersService.findOne(dto.providerId);
        const plan = await this.plansService.findOne(dto.planId);

        const realAmount = +plan.price;
        if (+dto.amount !== realAmount) {
        throw new BadRequestException('Monto inválido para el plan.');
        }

        const providerEmail = provider.usuario?.email;
        if (!providerEmail) {
        throw new BadRequestException('El proveedor no tiene un correo válido.');
        }

        const externalReference = `payment-${Date.now()}-${dto.providerId}`;

        const payment = this.paymentRepository.create({
        provider,
        plan,
        amount: realAmount,
        status: 'pending',
        externalReference,
        });

        const saved = await this.paymentRepository.save(payment);

        const preference = await this.mercadoPagoService.createPreference({
            amount: realAmount,
            planName: plan.name,
            providerEmail,
            providerId: provider.id,
            externalReference,
        });

        return {
        init_point: preference.init_point,
        mercadoPagoId: preference.id,
        paymentId: saved.id,
        };
    }

    async updateStatus(dto: UpdatePaymentStatusDto): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({
        where: { id: dto.paymentId },
        });

        if (!payment) throw new NotFoundException('Pago no encontrado');

        const info = await this.mercadoPagoService.getPaymentStatusById(dto.mercadoPagoId);

        if (
        +info.amount !== +payment.amount ||
        info.external_reference !== payment.externalReference
        ) {
        throw new BadRequestException('Validación fallida del pago.');
        }

        payment.status = dto.status;
        payment.mercadoPagoId = dto.mercadoPagoId;

        return this.paymentRepository.save(payment);
    }

    async findAll(): Promise<Payment[]> {
        return this.paymentRepository.find({
        order: { createdAt: 'DESC' },
        });
    }

    async findByProvider(providerId: number): Promise<Payment[]> {
        return this.paymentRepository.find({
        where: { provider: { id: providerId } },
        order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({ where: { id } });
        if (!payment) throw new NotFoundException('Pago no encontrado');
        return payment;
    }

    async isPaymentApproved(paymentId: string): Promise<boolean> {
        const payment = await this.findOne(paymentId);
        return payment.status === 'approved';
    }

    async getPaymentSummary(paymentId: string): Promise<{
        provider: string;
        plan: string;
        amount: number;
        status: string;
        createdAt: Date;
    }> {
        const payment = await this.findOne(paymentId);
        return {
        provider: payment.provider.usuario.email,
        plan: payment.plan.name,
        amount: +payment.amount,
        status: payment.status,
        createdAt: payment.createdAt,
        };
    }
}
