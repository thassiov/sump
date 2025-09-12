import { IAccountService } from '../../../../services/account/types/service.type';
import { ITenantService } from '../../../../services/tenant/types/service.type';
import { ITenant } from '../../../../services/tenant/types/tenant.type';
import { GetAccountsByTenantIdSUseCaseResultDto } from './dto.type';

type GetAccountsByTenantIdServices = {
  tenant: ITenantService;
  account: IAccountService;
};

type GetAccountsByTenantIdSUseCase = (
  services: GetAccountsByTenantIdServices,
  id: ITenant['id']
) => Promise<GetAccountsByTenantIdSUseCaseResultDto>;

export type { GetAccountsByTenantIdServices, GetAccountsByTenantIdSUseCase };
