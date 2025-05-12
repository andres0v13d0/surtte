import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Patch,
    Query,
    ParseUUIDPipe,
    UseGuards,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../users/entity/user.entity';

@Controller('plans')
export class PlansController {
    constructor(private readonly plansService: PlansService) {}

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMIN)
    @Post()
    create(@Body() createPlanDto: CreatePlanDto) {
        return this.plansService.create(createPlanDto);
    }

    @Get()
    findAll() {
        return this.plansService.findAll();
    }

    @Get('search')
    search(@Query('q') query: string) {
        return this.plansService.search(query);
    }

    @Get('names')
    getPlanNames() {
        return this.plansService.getPlanNames();
    }

    @Get(':id/summary')
    getSummary(@Param('id', ParseUUIDPipe) id: string) {
        return this.plansService.getSummary(id);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.plansService.findOne(id);
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMIN)
    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updatePlanDto: UpdatePlanDto,
    ) {
        return this.plansService.update(id, updatePlanDto);
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMIN)
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.plansService.remove(id);
    }
}
