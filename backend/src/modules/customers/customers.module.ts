import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

import { Customer } from './entity/customer.entity';
import { User } from '../users/entity/user.entity';
import { Provider } from '../providers/entity/provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      User,
      Provider,
    ]),
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
