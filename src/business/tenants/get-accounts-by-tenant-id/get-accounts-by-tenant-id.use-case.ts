import { contexts } from '../../../lib/contexts';
import { NotFoundError } from '../../../lib/errors';
import { ITenant } from '../../../services/tenant/types/tenant.type';
import { GetAccountsByTenantIdSUseCaseResultDto } from './types/dto.type';
import { GetAccountsByTenantIdServices } from './types/use-case.type';

async function getAccountsByTenantIdUseCase(
  services: GetAccountsByTenantIdServices,
  id: ITenant['id']
): Promise<GetAccountsByTenantIdSUseCaseResultDto> {
  const tenant = await services.tenant.getById(id);

  if (!tenant) {
    throw new NotFoundError({
      context: contexts.ACCOUNT_GET_BY_TENANT_ID,
      details: {
        input: { id },
      },
    });
  }

  return services.account.getByTenantId(id);
}

export { getAccountsByTenantIdUseCase };
