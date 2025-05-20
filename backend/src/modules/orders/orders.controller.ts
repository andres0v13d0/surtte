import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  CreateManualOrderDto,
  UpdateOrderDto,
  FilterOrdersDto,
} from './dto/order.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../users/entity/user.entity';

@Controller('orders')
@UseGuards(FirebaseAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto, @Req() req) {
    dto.userId = req.userDB.id;
    return this.ordersService.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(RolUsuario.PROVEEDOR)
  @Post('manual')
  async createManual(@Body() dto: CreateManualOrderDto, @Req() req) {
    dto.providerId = req.userDB.proveedorInfo?.id;
    if (!dto.providerId) throw new Error('No tienes proveedor asociado');
    return this.ordersService.createManual(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(RolUsuario.PROVEEDOR)
  @Get('pdf-upload/:orderId')
  async getPdfSignedUrl(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Query('mime') mime: string,
    @Query('filename') filename: string
  ) {
    return this.ordersService.generatePdfUploadUrl(orderId, mime, filename);
  }

  @Get('my')
  async getMyOrders(@Req() req) {
    return this.ordersService.getOrdersByUser(req.userDB.id);
  }

  @UseGuards(RolesGuard)
  @Roles(RolUsuario.PROVEEDOR)
  @Get('my-provider')
  async getMyProviderOrders(@Req() req) {
    const providerId = req.userDB.proveedorInfo?.id;
    if (!providerId) throw new Error('No tienes proveedor asociado');
    return this.ordersService.getOrdersByProvider(providerId);
  }

  @Get(':id')
  async getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrderById(id);
  }

  @Put(':id')
  async updateOrder(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @Get()
  async filterOrders(@Query() dto: FilterOrdersDto) {
    return this.ordersService.filter(dto);
  }
}
