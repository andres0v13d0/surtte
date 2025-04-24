import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto, UpdateCartItemDto, ToggleCheckDto } from './dto/cart.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req, @Query('checked') checked?: string) {
    const user = req.userDB;
    const onlyChecked = checked === 'true';
    return this.cartService.findAllByUser(user.id, onlyChecked);
  }

  @Get('count')
  async getCheckedCount(@Req() req) {
    const user = req.userDB;
    return this.cartService.countCheckedItems(user.id);
  }

  @Post()
  async addItem(@Req() req, @Body() dto: CreateCartItemDto) {
    const user = req.userDB;
    return this.cartService.addOrUpdateItem(user, dto);
  }

  @Patch(':id')
  async updateQuantity(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
    @Body() dto: UpdateCartItemDto,
  ) {
    const user = req.userDB;
    return this.cartService.updateQuantity(id, dto, user);
  }

  @Patch(':id/check')
  async toggleCheck(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
    @Body() dto: ToggleCheckDto,
  ) {
    const user = req.userDB;
    return this.cartService.toggleCheck(id, dto, user);
  }

  @Delete(':id')
  async deleteItem(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const user = req.userDB;
    return this.cartService.deleteItem(id, user);
  }

  @Delete()
  async clearCart(@Req() req) {
    const user = req.userDB;
    return this.cartService.clearCart(user.id);
  }

  @Get('selected')
  async getSelectedItems(@Req() req) {
    const user = req.userDB;
    return this.cartService.getSelectedItems(user.id);
  }
}
