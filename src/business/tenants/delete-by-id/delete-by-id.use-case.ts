import { ITenant } from '../../../services/tenant/types/tenant.type';
import { DeleteByIdServices } from './types/use-case.type';

async function deleteByIdUseCase(
  services: DeleteByIdServices,
  id: ITenant['id']
): Promise<boolean> {
  return services.tenant.deleteById(id);
}

export { deleteByIdUseCase };
