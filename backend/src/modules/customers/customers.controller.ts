import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../users/entity/user.entity';
import { FilterCustomersDto } from './dto/customer.dto';

@Controller('customers')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles(RolUsuario.PROVEEDOR)
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @Get()
    async getCustomers(
        @Req() req,
        @Query() filters: FilterCustomersDto,
    ) {
        const providerId = req.userDB.proveedorInfo?.id;
        if (!providerId) throw new Error('No tienes proveedor asociado');
        return this.customersService.getCustomersOfProvider(providerId, filters);
    }

    @Patch(':id/exclusive')
    async markAsExclusive(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const providerId = req.userDB.proveedorInfo?.id;
        return this.customersService.markAsExclusive(id, providerId);
    }

    @Patch(':id/remove-exclusive')
    async removeExclusive(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const providerId = req.userDB.proveedorInfo?.id;
        return this.customersService.removeExclusive(id, providerId);
    }
}
