import { Module } from '@nestjs/common';
import { EnvironmentController } from './environment.controller';
import { EnvironmentUseCase } from '../core/use-cases/environment.use-case';
import { EnvironmentService } from '../core/services/environment.service';
import { EnvironmentRepository } from '../core/repositories/environment.repository';

@Module({
  controllers: [EnvironmentController],
  providers: [EnvironmentUseCase, EnvironmentService, EnvironmentRepository],
  exports: [EnvironmentService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EnvironmentModule {}
