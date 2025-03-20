import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto, UpdateProviderDto } from './dto/provider.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  create(@Body() createProviderDto: CreateProviderDto) {
    return this.providersService.create(createProviderDto);
  }

  @Get()
  findAll() {
    return this.providersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.providersService.findOne(id);
  }

  @Get('/user/:usuario_id')
  findByUserId(@Param('usuario_id') usuario_id: number) {
    return this.providersService.findByUserId(usuario_id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateProviderDto: UpdateProviderDto) {
    return this.providersService.update(id, updateProviderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.providersService.remove(id);
  }
}
