    import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
    import { InjectRepository } from '@nestjs/typeorm';
    import { Repository, ILike } from 'typeorm';
    import { Plan } from './entity/plan.entity';
    import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';

@Injectable()
export class PlansService {
    constructor(
        @InjectRepository(Plan)
        private readonly planRepository: Repository<Plan>,
    ) {}

    async create(createPlanDto: CreatePlanDto): Promise<Plan> {
        const existing = await this.planRepository.findOne({ where: { name: createPlanDto.name } });
        if (existing) throw new BadRequestException('Ya existe un plan con ese nombre');

        const plan = this.planRepository.create(createPlanDto);
        return this.planRepository.save(plan);
    }

    async findAll(): Promise<Plan[]> {
        return this.planRepository.find({ order: { price: 'ASC' } });
    }

    async findOne(id: string): Promise<Plan> {
        const plan = await this.planRepository.findOne({ where: { id } });
        if (!plan) throw new NotFoundException('Plan no encontrado');
        return plan;
    }

    async findByName(name: string): Promise<Plan> {
        const plan = await this.planRepository.findOne({ where: { name } });
        if (!plan) throw new NotFoundException('Plan no encontrado por nombre');
        return plan;
    }

    async search(text: string): Promise<Plan[]> {
        return this.planRepository.find({
        where: [
            { name: ILike(`%${text}%`) },
            { description: ILike(`%${text}%`) },
        ],
        order: { price: 'ASC' },
        });
    }

    async update(id: string, updateDto: UpdatePlanDto): Promise<Plan> {
        const plan = await this.findOne(id);
        const updated = Object.assign(plan, updateDto);
        return this.planRepository.save(updated);
    }

    async remove(id: string): Promise<void> {
        const plan = await this.findOne(id);
        await this.planRepository.remove(plan);
    }

    async exists(id: string): Promise<boolean> {
        return await this.planRepository.exist({ where: { id } });
    }

    async getPlanPrice(id: string): Promise<number> {
        const plan = await this.findOne(id);
        return +plan.price;
    }

    async getPlanNames(): Promise<string[]> {
        const plans = await this.planRepository.find();
        return plans.map(p => p.name);
    }

    async getSummary(id: string): Promise<{ name: string; price: number }> {
        const plan = await this.findOne(id);
        return { name: plan.name, price: +plan.price };
    }
}
