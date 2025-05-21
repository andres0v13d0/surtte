import {
    Injectable,
    NotFoundException,
    BadRequestException,
    forwardRef,
    OnModuleInit,
    Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entity/payment.entity';
import { CreatePaymentDto, UpdatePaymentStatusDto } from './dto/payment.dto';
import { MercadoPagoService } from './mercado-pago/mercado-pago.service';
import { ProvidersService } from '../providers/providers.service';
import { PlansService } from '../plans/plans.service';
import { User } from '../users/entity/user.entity';
import { ProviderRequestsService } from '../provider-requests/provider-requests.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';


@Injectable()
export class PaymentsService implements OnModuleInit {
    private subscriptionsService: SubscriptionsService; 

    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        private readonly mercadoPagoService: MercadoPagoService,
        private readonly providersService: ProvidersService,
        private readonly plansService: PlansService,
        private readonly providerRequestsService: ProviderRequestsService,
        @Inject(forwardRef(() => SubscriptionsService))
        private readonly injectedSubscriptionService: SubscriptionsService,
    ) { }

    onModuleInit() {
        this.subscriptionsService = this.injectedSubscriptionService; // ✅ aquí se asigna
    }

    async create(
        dto: CreatePaymentDto,
        user: User,
    ): Promise<{
        init_point: string;
        mercadoPagoId: string;
        paymentId: string;
    }> {
        const plan = await this.plansService.findOne(dto.planId);
        const realAmount = +plan.price;

        if (+dto.amount !== realAmount) {
            throw new BadRequestException('Monto inválido para el plan.');
        }

        const externalReference = `payment-${Date.now()}-${user.id}`;

        const payment = this.paymentRepository.create({
            plan,
            amount: realAmount,
            status: 'pending',
            externalReference,
        });

        const saved: Payment = await this.paymentRepository.save(payment);

        const preference = await this.mercadoPagoService.createPreference({
            amount: realAmount,
            planName: plan.name,
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
            provider: payment.provider?.usuario?.email ?? 'N/A',
            plan: payment.plan.name,
            amount: +payment.amount,
            status: payment.status,
            createdAt: payment.createdAt,
        };
    }

    private extractUserIdFromReference(reference: string): number {
        const parts = reference.split('-');
        const userId = parts[2];

        if (!userId || isNaN(+userId)) {
            throw new BadRequestException('Referencia externa inválida');
        }

        return +userId;
    }


    async markSuccess(dto: UpdatePaymentStatusDto) {
        const payment = await this.paymentRepository.findOne({ where: { id: dto.paymentId } });
        if (!payment) throw new NotFoundException('Pago no encontrado');

        const info = await this.mercadoPagoService.getPaymentStatusById(dto.mercadoPagoId);
        if (info.status !== 'approved') {
            throw new BadRequestException('El pago no fue aprobado');
        }

        payment.status = 'approved';
        payment.mercadoPagoId = dto.mercadoPagoId;
        await this.paymentRepository.save(payment);

        const userId = this.extractUserIdFromReference(payment.externalReference);
        const solicitud = await this.providerRequestsService.findLatestByUser(userId);
        if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

        await this.providerRequestsService.marcarPagoYConvertir(solicitud.id);

        const provider = await this.providersService.findByUserId(userId);
        if (!provider) throw new NotFoundException('Proveedor no encontrado');

        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(now.getMonth() + 1);

        await this.subscriptionsService.create({
            providerId: provider.id,
            planId: payment.plan.id,
            paymentId: payment.id,
            startDate: now.toISOString(),
            endDate: endDate.toISOString(),
        });


        return { success: true };
    }

}
