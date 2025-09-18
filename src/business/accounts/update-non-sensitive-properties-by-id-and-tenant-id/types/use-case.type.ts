import { IAccount } from '../../../../services/account/types/account.type';
import { IUpdateAccountNonSensitivePropertiesDto } from '../../../../services/account/types/dto.type';
import { IAccountService } from '../../../../services/account/types/service.type';
import { ITenantService } from '../../../../services/tenant/types/service.type';

type UpdateNonSensitivePropertiesByIdAndTenantIdServices = {
  tenant: ITenantService;
  account: IAccountService;
};

type UpdateNonSensitivePropertiesByIdAndTenantIdUseCase = (
  services: UpdateNonSensitivePropertiesByIdAndTenantIdServices,
  accountId: IAccount['id'],
  tenantId: IAccount['tenantId'],
  dto: IUpdateAccountNonSensitivePropertiesDto
) => Promise<boolean>;

export type {
  UpdateNonSensitivePropertiesByIdAndTenantIdServices,
  UpdateNonSensitivePropertiesByIdAndTenantIdUseCase,
};
