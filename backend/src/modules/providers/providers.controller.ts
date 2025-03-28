import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto, UpdateProviderDto } from './dto/provider.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../users/entity/user.entity';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post()
  async create(@Body() dto: CreateProviderDto): Promise<any> {
    return this.providersService.create(dto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  async getMyProviderInfo(@Req() req) {
    const userId = req.userDB.id;
    return this.providersService.findByUserId(userId);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN, RolUsuario.VERIFICADOR)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.findOne(id);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @Get()
  async findAll() {
    return this.providersService.findAll();
  }

  @UseGuards(FirebaseAuthGuard)
  @Put('me')
  async updateOwn(@Req() req, @Body() dto: UpdateProviderDto) {
    const userId = req.userDB.id;
    const provider = await this.providersService.findByUserId(userId);
    return this.providersService.update(provider.id, dto);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN, RolUsuario.VERIFICADOR)
  @Put(':id/estado')
  async updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: 'pendiente' | 'en_revision' | 'verificado' | 'rechazado' },
  ) {
    return this.providersService.updateEstadoVerificacion(id, body.estado);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @Put(':id/pago')
  async marcarPago(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.marcarPago(id);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN, RolUsuario.VERIFICADOR)
  @Put(':id/documentos')
  async marcarDocumentos(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.marcarDocumentosCompletos(id);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.remove(id);
  }
}
