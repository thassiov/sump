import { ICreateAccountDto } from '../../../../services/account/types/dto.type';
import { IAccountService } from '../../../../services/account/types/service.type';
import { ITenantService } from '../../../../services/tenant/types/service.type';
import { ITenant } from '../../../../services/tenant/types/tenant.type';

type CreateAccountServices = {
  tenant: ITenantService;
  account: IAccountService;
};

type CreateAccountUseCase = (
  services: CreateAccountServices,
  tenantId: ITenant['id'],
  dto: ICreateAccountDto
) => Promise<string>;

export type { CreateAccountServices, CreateAccountUseCase };
