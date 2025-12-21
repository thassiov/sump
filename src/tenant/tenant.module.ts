import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantUseCase } from '../core/use-cases/tenant.use-case';
import { TenantService } from '../core/services/tenant.service';
import { TenantRepository } from '../core/repositories/tenant.repository';
import { TenantAccountModule } from '../tenant-account/tenant-account.module';
import { EnvironmentModule } from '../environment/environment.module';

@Module({
  imports: [TenantAccountModule, EnvironmentModule],
  controllers: [TenantController],
  providers: [TenantUseCase, TenantService, TenantRepository],
  exports: [TenantService],
})
export class TenantModule {}
