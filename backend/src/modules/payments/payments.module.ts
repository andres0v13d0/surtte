import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MercadoPagoService } from './mercado-pago/mercado-pago.service';
import { ProviderRequestsModule } from '../provider-requests/provider-requests.module';
import { forwardRef } from '@nestjs/common';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';



import { Payment } from './entity/payment.entity';
import { Plan } from '../plans/entity/plan.entity';
import { Provider } from '../providers/entity/provider.entity';
import { User } from '../users/entity/user.entity';

import { PlansModule } from '../plans/plans.module';
import { ProvidersModule } from '../providers/providers.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Plan, Provider, User]),
    PlansModule,
    ProvidersModule,
    UsersModule,
    forwardRef(() => ProviderRequestsModule),
    forwardRef(() => SubscriptionsModule),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, MercadoPagoService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
