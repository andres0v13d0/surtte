import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ProviderRequestsService } from './provider-requests.service';
import { ProviderRequestDto } from './dto/provider-request.dto';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolUsuario } from '../users/entity/user.entity';

@Controller('provider-requests')
export class ProviderRequestsController {
    constructor(private readonly service: ProviderRequestsService) {}

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.COMERCIANTE)
    @Post('generate-url')
    async generateSignedUrl(
        @Body() body: { mimeType: string; filename: string },
    ) {
        return this.service.generateSignedUrl(body.mimeType, body.filename);
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.COMERCIANTE)
    @Post()
    async create(
        @Request() req,
        @Body() dto: ProviderRequestDto,
    ) {
        return this.service.createRequest(dto, req.user);
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMIN)
    @Get()
    async findAll() {
        return this.service.findAll();
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMIN)
    @Patch(':id/revisar')
    async revisarSolicitud(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ProviderRequestDto,
    ) {
        return this.service.revisarSolicitud(id, dto);
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMIN)
    @Patch(':id/convertir')
    async convertirProveedor(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.service.marcarPagoYConvertir(id);
    }
}
