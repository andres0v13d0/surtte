import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ChatEntity } from '../chat/entity/chat.entity';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        private readonly subscriptionsService: SubscriptionsService,

        @InjectRepository(ChatEntity)
        private readonly chatRepository: Repository<ChatEntity>,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async expireSubscriptions() {
        this.logger.log('⏰ Expirando suscripciones vencidas...');
        await this.subscriptionsService.expireOldSubscriptions();
        this.logger.log('✅ Suscripciones vencidas marcadas como expiradas.');
    }

    @Cron(CronExpression.EVERY_DAY_AT_3AM)
    async cleanOldChatMessages() {
        this.logger.log('🧹 Limpiando mensajes de chat con más de 5 días...');

        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        const result = await this.chatRepository.delete({
            createdAt: LessThan(fiveDaysAgo),
        });

        this.logger.log(`✅ Mensajes eliminados: ${result.affected}`);
    }
}
