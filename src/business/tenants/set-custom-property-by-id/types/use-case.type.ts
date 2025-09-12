import { ITenantService } from '../../../../services/tenant/types/service.type';
import { ITenant } from '../../../../services/tenant/types/tenant.type';

type SetCustomPropertyByIdServices = {
  tenant: ITenantService;
};

type SetCustomPropertyByIdUseCase = (
  services: SetCustomPropertyByIdServices,
  id: ITenant['id'],
  customProperty: ITenant['customProperties']
) => Promise<boolean>;

export type { SetCustomPropertyByIdServices, SetCustomPropertyByIdUseCase };
