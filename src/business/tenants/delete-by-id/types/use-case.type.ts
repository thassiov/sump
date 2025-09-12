import { ITenantService } from '../../../../services/tenant/types/service.type';
import { ITenant } from '../../../../services/tenant/types/tenant.type';

type DeleteByIdServices = {
  tenant: ITenantService;
};

type DeleteByIdUseCase = (
  services: DeleteByIdServices,
  id: ITenant['id']
) => Promise<boolean>;

export type { DeleteByIdServices, DeleteByIdUseCase };
