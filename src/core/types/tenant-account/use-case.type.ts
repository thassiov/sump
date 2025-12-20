import { ITenantService } from '../tenant/service.type';
import { ITenantAccountService } from './service.type';

type TenantAccountUseCaseServices = {
  tenant: ITenantService;
  tenantAccount: ITenantAccountService;
};

export type { TenantAccountUseCaseServices };
