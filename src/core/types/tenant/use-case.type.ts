import { IAccountService } from '../account/service.type';
import { ITenantEnvironmentService } from '../tenant-environment/service.type';
import { ITenantService } from './service.type';

type TenantUseCaseServices = {
  account: IAccountService;
  tenant: ITenantService;
  tenantEnvironment: ITenantEnvironmentService;
};

export type { TenantUseCaseServices };
