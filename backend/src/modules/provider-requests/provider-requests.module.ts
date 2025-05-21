import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderRequestsController } from './provider-requests.controller';
import { ProviderRequestsService } from './provider-requests.service';
import { ProviderRequest } from './entity/provider-request.entity';
import { User } from '../users/entity/user.entity';
import { Provider } from '../providers/entity/provider.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProviderRequest, User, Provider]),
    UsersModule,
  ],
  controllers: [ProviderRequestsController],
  providers: [ProviderRequestsService],
  exports: [ProviderRequestsService],
})
export class ProviderRequestsModule {}
