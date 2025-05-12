import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
    Req,
    ParseUUIDPipe,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../users/entity/user.entity';

@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) {}

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMIN)
    @Post()
    create(@Body() dto: CreateSubscriptionDto) {
        return this.subscriptionsService.create(dto);
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMIN)
    @Post('from-payment/:paymentId')
    createFromPayment(@Param('paymentId', ParseUUIDPipe) paymentId: string) {
        return this.subscriptionsService.createFromPayment(paymentId);
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMIN)
    @Get()
    findAll() {
        return this.subscriptionsService.findAll();
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.PROVEEDOR)
    @Get('mine')
    findMine(@Req() req) {
        const providerId = req.userDB.proveedorInfo?.id;
        return this.subscriptionsService.findByProvider(providerId);
    }

    @UseGuards(FirebaseAuthGuard)
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.subscriptionsService.findOne(id);
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMIN)
    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateSubscriptionDto,
    ) {
        return this.subscriptionsService.update(id, dto);
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMIN)
    @Patch(':id/cancel')
    cancel(@Param('id', ParseUUIDPipe) id: string) {
        return this.subscriptionsService.cancel(id);
    }
}
