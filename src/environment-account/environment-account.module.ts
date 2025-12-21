import { Module } from '@nestjs/common';
import { EnvironmentAccountController } from './environment-account.controller';
import { EnvironmentAccountUseCase } from '../core/use-cases/environment-account.use-case';
import { EnvironmentAccountService } from '../core/services/environment-account.service';
import { EnvironmentAccountRepository } from '../core/repositories/environment-account.repository';

@Module({
  controllers: [EnvironmentAccountController],
  providers: [
    EnvironmentAccountUseCase,
    EnvironmentAccountService,
    EnvironmentAccountRepository,
  ],
  exports: [EnvironmentAccountService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EnvironmentAccountModule {}
