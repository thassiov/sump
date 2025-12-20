import { ITenantAccountService } from '../tenant-account/service.type';
import { IEnvironmentService } from '../environment/service.type';
import { ITenantService } from './service.type';

type TenantUseCaseServices = {
  tenantAccount: ITenantAccountService;
  tenant: ITenantService;
  environment: IEnvironmentService;
};

export type { TenantUseCaseServices };
