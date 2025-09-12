import { IUpdateTenantNonSensitivePropertiesDto } from '../../../../services/tenant/types/dto.type';
import { ITenantService } from '../../../../services/tenant/types/service.type';
import { ITenant } from '../../../../services/tenant/types/tenant.type';

type UpdateNonSensitivePropertiesServices = {
  tenant: ITenantService;
};

type UpdateNonSensitivePropertiesUseCase = (
  services: UpdateNonSensitivePropertiesServices,
  id: ITenant['id'],
  dto: IUpdateTenantNonSensitivePropertiesDto
) => Promise<boolean>;

export type {
  UpdateNonSensitivePropertiesServices,
  UpdateNonSensitivePropertiesUseCase,
};
