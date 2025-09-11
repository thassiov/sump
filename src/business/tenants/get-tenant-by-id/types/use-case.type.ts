import { ITenantEnvironmentService } from '../../../../services/tenant-environment/types/service.type';
import { ITenantService } from '../../../../services/tenant/types/service.type';
import { ITenant } from '../../../../services/tenant/types/tenant.type';
import { GetTenantByIdUseCaseResultDto } from './dto.type';

type GetTenantByIdServices = {
  tenant: ITenantService;
  tenantEnvironment: ITenantEnvironmentService;
};

type GetTenantByIdUseCase = (
  services: GetTenantByIdServices,
  id: ITenant['id']
) => Promise<GetTenantByIdUseCaseResultDto>;

export type { GetTenantByIdServices, GetTenantByIdUseCase };
