import { Module } from '@nestjs/common';
import { TenantAccountController } from './tenant-account.controller';
import { TenantAccountUseCase } from '../core/use-cases/tenant-account.use-case';
import { TenantAccountService } from '../core/services/tenant-account.service';
import { TenantAccountRepository } from '../core/repositories/tenant-account.repository';
import { TenantService } from '../core/services/tenant.service';
import { TenantRepository } from '../core/repositories/tenant.repository';

@Module({
  controllers: [TenantAccountController],
  providers: [
    TenantAccountUseCase,
    TenantAccountService,
    TenantAccountRepository,
    TenantService,
    TenantRepository,
  ],
  exports: [TenantAccountService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TenantAccountModule {}
