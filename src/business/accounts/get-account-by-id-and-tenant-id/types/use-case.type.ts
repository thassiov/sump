import { IAccount } from '../../../../services/account/types/account.type';
import { IAccountService } from '../../../../services/account/types/service.type';
import { ITenant } from '../../../../services/tenant/types/tenant.type';
import { GetAccountByIdAndTenantIdUseCaseResultDto } from './dto.type';

type GetAccountByIdAndTenantIdServices = {
  account: IAccountService;
};

type GetAccountByIdAndTenantIdUseCase = (
  services: GetAccountByIdAndTenantIdServices,
  tenantId: ITenant['id'],
  id: IAccount['id']
) => Promise<GetAccountByIdAndTenantIdUseCaseResultDto>;

export type {
  GetAccountByIdAndTenantIdServices,
  GetAccountByIdAndTenantIdUseCase,
};
