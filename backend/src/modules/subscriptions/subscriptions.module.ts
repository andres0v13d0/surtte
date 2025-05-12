import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

import { Subscription } from './entity/subscription.entity';
import { Plan } from '../plans/entity/plan.entity';
import { Provider } from '../providers/entity/provider.entity';
import { Payment } from '../payments/entity/payment.entity';
import { User } from '../users/entity/user.entity';

import { PlansModule } from '../plans/plans.module';
import { ProvidersModule } from '../providers/providers.module';
import { PaymentsModule } from '../payments/payments.module';
import { UsersModule } from '../users/users.module';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, Plan, Provider, Payment, User, Product]),
    PlansModule,
    ProvidersModule,
    PaymentsModule,
    UsersModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
