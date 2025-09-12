import { ITenant } from '../../../services/tenant/types/tenant.type';
import { SetCustomPropertyByIdServices } from './types/use-case.type';

async function setCustomPropertyByIdUseCase(
  services: SetCustomPropertyByIdServices,
  id: ITenant['id'],
  customProperty: ITenant['customProperties']
): Promise<boolean> {
  return services.tenant.setCustomPropertyById(id, customProperty);
}

export { setCustomPropertyByIdUseCase };
