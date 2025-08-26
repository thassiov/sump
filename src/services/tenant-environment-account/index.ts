import { TenantEnvironmentAccountHttpService } from './tenant-environment-account.http-service';
import { TenantEnvironmentAccountRepository } from './tenant-environment-account.repository';
import { makeServiceEndpoints } from './tenant-environment-account.routes';
import { TenantEnvironmentAccountService } from './tenant-environment-account.service';

export const tenantEnvironmentAccount = {
  service: TenantEnvironmentAccountService,
  httpService: TenantEnvironmentAccountHttpService,
  repository: TenantEnvironmentAccountRepository,
  endpoints: makeServiceEndpoints,
};
