import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { VerificationCode } from '../entities/verification-code.entity';

@Injectable()
export class VerificationCleanerJob {
  private readonly logger = new Logger(VerificationCleanerJob.name);

  constructor(
    @InjectRepository(VerificationCode)
    private readonly verificationRepo: Repository<VerificationCode>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCleanup() {
    const now = new Date();

    const result = await this.verificationRepo.delete({
      isConfirmed: false,
      expiresAt: LessThan(now),
    });

    if (result.affected && result.affected > 0) {
      this.logger.log(`🧼 Eliminados ${result.affected} códigos expirados`);
    }
  }
}
