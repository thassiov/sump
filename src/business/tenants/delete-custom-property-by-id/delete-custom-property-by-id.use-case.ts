import { ITenant } from '../../../services/tenant/types/tenant.type';
import { DeleteCustomPropertyByIdServices } from './types/use-case.type';

async function deleteCustomPropertyByIdUseCase(
  services: DeleteCustomPropertyByIdServices,
  id: ITenant['id'],
  customPropertyKey: string
): Promise<boolean> {
  return services.tenant.deleteCustomPropertyById(id, customPropertyKey);
}

export { deleteCustomPropertyByIdUseCase };
