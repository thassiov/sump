import { contexts } from '../../../lib/contexts';
import { NotFoundError, ValidationError } from '../../../lib/errors';
import { setupLogger } from '../../../lib/logger/logger';
import { formatZodError } from '../../../lib/utils/formatters';
import {
  ITenant,
  tenantSchema,
} from '../../../services/tenant/types/tenant.type';
import { CreateNewTenantServices } from '../create-new-tenant/types/use-case.type';
import { GetTenantByIdUseCaseResultDto } from './types/dto.type';

async function getTenantByIdUseCase(
  services: CreateNewTenantServices,
  id: ITenant['id']
): Promise<GetTenantByIdUseCaseResultDto> {
  const logger = setupLogger('get-tenant-by-id-use-case');

  const isIdValid = tenantSchema.pick({ id: true }).safeParse({ id });

  if (!isIdValid.success) {
    const errorInstance = new ValidationError({
      details: {
        input: { id },
        errors: formatZodError(isIdValid.error.issues),
      },
      context: contexts.TENANT_GET_BY_ID,
    });

    logger.error(errorInstance);
    throw errorInstance;
  }

  const tenant = await services.tenant.getById(id);

  if (!tenant) {
    throw new NotFoundError({
      context: contexts.TENANT_GET_BY_ID,
      details: {
        input: { id },
      },
    });
  }

  const environments = await services.tenantEnvironment.getByTenantId(id);

  return { ...tenant, environments: environments ?? [] };
}

export { getTenantByIdUseCase };
