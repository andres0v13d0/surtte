import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    UseGuards,
    Req,
    ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentStatusDto } from './dto/payment.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../users/entity/user.entity';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Post('create')
    create(@Body() dto: CreatePaymentDto) {
        return this.paymentsService.create(dto);
    }

    @Patch('update-status')
    updateStatus(@Body() dto: UpdatePaymentStatusDto) {
        return this.paymentsService.updateStatus(dto);
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMIN)
    @Get()
    findAll() {
        return this.paymentsService.findAll();
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.PROVEEDOR)
    @Get('mine')
    findMine(@Req() req) {
        const providerId = req.userDB.proveedorInfo?.id;
        return this.paymentsService.findByProvider(providerId);
    }

    @UseGuards(FirebaseAuthGuard)
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.paymentsService.findOne(id);
    }

    @UseGuards(FirebaseAuthGuard)
    @Get(':id/summary')
    getSummary(@Param('id', ParseUUIDPipe) id: string) {
        return this.paymentsService.getPaymentSummary(id);
    }
}
