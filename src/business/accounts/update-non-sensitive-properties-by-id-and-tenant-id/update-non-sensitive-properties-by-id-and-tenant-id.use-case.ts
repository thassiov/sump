import { contexts } from '../../../lib/contexts';
import { NotFoundError } from '../../../lib/errors';
import { IAccount } from '../../../services/account/types/account.type';
import { IUpdateTenantNonSensitivePropertiesDto } from '../../../services/tenant/types/dto.type';
import { UpdateNonSensitivePropertiesByIdAndTenantIdServices } from './types/use-case.type';

async function updateNonSensitivePropertiesByIdAndTenantIdUseCase(
  services: UpdateNonSensitivePropertiesByIdAndTenantIdServices,
  accountId: IAccount['id'],
  tenantId: IAccount['tenantId'],
  dto: IUpdateTenantNonSensitivePropertiesDto
): Promise<boolean> {
  const tenant = await services.tenant.getById(tenantId);

  if (!tenant) {
    throw new NotFoundError({
      context: contexts.ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID,
      details: {
        input: { tenantId },
      },
    });
  }

  return services.account.updateNonSensitivePropertiesById(accountId, dto, {
    tenantId: tenantId,
  });
}

export { updateNonSensitivePropertiesByIdAndTenantIdUseCase };
