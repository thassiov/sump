import { ITenantService } from '../../../../services/tenant/types/service.type';
import { ITenant } from '../../../../services/tenant/types/tenant.type';

type DeleteCustomPropertyByIdServices = {
  tenant: ITenantService;
};

type DeleteCustomPropertyByIdUseCase = (
  services: DeleteCustomPropertyByIdServices,
  id: ITenant['id'],
  customPropertyKey: string
) => Promise<boolean>;

export type {
  DeleteCustomPropertyByIdServices,
  DeleteCustomPropertyByIdUseCase,
};
