import { IUpdateTenantNonSensitivePropertiesDto } from '../../../services/tenant/types/dto.type';
import { ITenant } from '../../../services/tenant/types/tenant.type';
import { UpdateNonSensitivePropertiesServices } from './types/use-case.type';

async function updateNonSensitivePropertiesByIdUseCase(
  services: UpdateNonSensitivePropertiesServices,
  id: ITenant['id'],
  dto: IUpdateTenantNonSensitivePropertiesDto
): Promise<boolean> {
  return services.tenant.updateNonSensitivePropertiesById(id, dto);
}

export { updateNonSensitivePropertiesByIdUseCase };
