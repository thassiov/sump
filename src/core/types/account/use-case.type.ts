import { ITenantService } from '../tenant/service.type';
import { IAccountService } from './service.type';

type AccountUseCaseServices = {
  tenant: ITenantService;
  account: IAccountService;
};

export type { AccountUseCaseServices };
