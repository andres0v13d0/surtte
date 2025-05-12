import {
    BadRequestException,
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, LessThan, MoreThan } from 'typeorm';
import { Subscription } from './entity/subscription.entity';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';
import { PlansService } from '../plans/plans.service';
import { ProvidersService } from '../providers/providers.service';
import { PaymentsService } from '../payments/payments.service';
import { getPlanLimits } from './plan-limits';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class SubscriptionsService {
    constructor(
        @InjectRepository(Subscription)
        private readonly subscriptionRepository: Repository<Subscription>,
        private readonly plansService: PlansService,
        private readonly providersService: ProvidersService,
        private readonly paymentsService: PaymentsService,
        @InjectRepository(Product)
        private readonly productsRepository: Repository<Product>,
    ) {}

    async create(dto: CreateSubscriptionDto): Promise<Subscription> {
        const provider = await this.providersService.findOne(dto.providerId);
        const plan = await this.plansService.findOne(dto.planId);
        const payment = await this.paymentsService.findOne(dto.paymentId);

        const sub = this.subscriptionRepository.create({
        provider,
        plan,
        payment,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: 'active',
        });

        return this.subscriptionRepository.save(sub);
    }

    async createFromPayment(paymentId: string): Promise<Subscription> {
        const payment = await this.paymentsService.findOne(paymentId);
        if (payment.status !== 'approved') {
            throw new BadRequestException('No se puede activar una suscripción sin pago aprobado.');
        }

        const now = new Date();
        const endDate = new Date();
        endDate.setMonth(now.getMonth() + 1);

        const existing = await this.subscriptionRepository.findOne({
            where: {
                provider: { id: payment.provider.id },
                status: 'active',
            },
        });

        if (existing) {
            throw new BadRequestException('El proveedor ya tiene una suscripción activa.');
        }

        const subscription = this.subscriptionRepository.create({
            provider: payment.provider,
            plan: payment.plan,
            payment,
            startDate: now,
            endDate,
            status: 'active',
        });

        return this.subscriptionRepository.save(subscription);
    }

    async isActive(providerId: number): Promise<boolean> {
        const now = new Date();

        const active = await this.subscriptionRepository.findOne({
            where: {
                provider: { id: providerId },
                status: 'active',
                endDate: MoreThan(now),
            },
        });

        return !!active;
    }

    async cancel(subscriptionId: string): Promise<Subscription> {
        const sub = await this.findOne(subscriptionId);
        sub.status = 'cancelled';
        return this.subscriptionRepository.save(sub);
    }

    async expireOldSubscriptions(): Promise<void> {
        const now = new Date();
        const expired = await this.subscriptionRepository.find({
            where: {
                status: 'active',
                endDate: LessThan(now),
            },
        });

        for (const sub of expired) {
            sub.status = 'expired';
            await this.subscriptionRepository.save(sub);
        }
    }

    async findAll(): Promise<Subscription[]> {
        return this.subscriptionRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findByProvider(providerId: number): Promise<Subscription[]> {
        return this.subscriptionRepository.find({
            where: { provider: { id: providerId } },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Subscription> {
        const sub = await this.subscriptionRepository.findOne({ where: { id } });
        if (!sub) throw new NotFoundException('Suscripción no encontrada');
        return sub;
    }

    async update(id: string, dto: UpdateSubscriptionDto): Promise<Subscription> {
        const sub = await this.findOne(id);
        Object.assign(sub, dto);
        return this.subscriptionRepository.save(sub);
    }

    async getActiveByProvider(providerId: number): Promise<Subscription | null> {
        const now = new Date();
        return this.subscriptionRepository.findOne({
            where: {
                provider: { id: providerId },
                status: 'active',
                endDate: MoreThan(now),
            },
        });
    }


    async validateProviderCanAddProduct(providerId: number): Promise<void> {
        const subscription = await this.getActiveByProvider(providerId);
        if (!subscription) {
            throw new ForbiddenException('No tienes una suscripción activa');
        }

        const planName = subscription.plan.name;
        const limits = getPlanLimits(planName);

        const currentCount = await this.productsRepository.count({
            where: { provider: { id: providerId } },
        });

        if (currentCount >= limits.maxProducts) {
            throw new BadRequestException(`Tu plan (${planName}) permite máximo ${limits.maxProducts} productos.`);
        }
    }
}
