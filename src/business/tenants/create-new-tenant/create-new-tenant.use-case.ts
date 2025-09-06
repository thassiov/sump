import { contexts } from '../../../lib/contexts';
import { ConflictError, ValidationError } from '../../../lib/errors';
import { setupLogger } from '../../../lib/logger/logger';
import { formatZodError } from '../../../lib/utils/formatters';
import { IAccountUserDefinedIdentification } from '../../../services/account/types/dto.type';
import {
  CreateNewTenantUseCaseDto,
  createNewTenantUseCaseDtoSchema,
  CreateNewTenantUseCaseResultDto,
} from './types/dto.type';
import { CreateNewTenantServices } from './types/use-case.type';

async function createNewTenantUseCase(
  services: CreateNewTenantServices,
  createNewTenantDto: CreateNewTenantUseCaseDto
): Promise<CreateNewTenantUseCaseResultDto> {
  const logger = setupLogger('create-new-tenant-use-case');

  // @NOTE: a lot of the schema validation is already being made here. the validations inside of each service
  //  should _maybe_ be moved elsewhere so it wont be repeated, wasting cpu cycles
  const isValidDto =
    createNewTenantUseCaseDtoSchema.safeParse(createNewTenantDto);

  if (!isValidDto.success) {
    const errorInstance = new ValidationError({
      details: {
        input: { ...createNewTenantDto },
        errors: formatZodError(isValidDto.error.issues),
      },
      context: contexts.CREATE_NEW_TENANT_USE_CASE,
    });

    logger.error(errorInstance);
    throw errorInstance;
  }

  const { email, phone, username } = createNewTenantDto.account;

  const hits = await services.account.getByUserDefinedIdentification({
    email,
    phone,
    username,
  });

  if (hits) {
    const errorEntries = [{ email }, { phone }, { username }]
      .map((udi) => {
        const [key, value] = Object.entries(udi)[0] as [
          keyof IAccountUserDefinedIdentification,
          string | undefined,
        ];

        if (!value) {
          return;
        }

        const inUse = hits.some((hit) => hit[key] === udi[key]);

        if (!inUse) {
          return;
        }

        return [key, 'user defined identification already in use'];
      })
      .filter((i) => i) as [string, string][]; // little hack to filter out `undefined` values

    const errors = Object.fromEntries(errorEntries);

    const errorInstance = new ConflictError({
      details: {
        input: { ...createNewTenantDto },
        errors,
      },
      context: contexts.CREATE_NEW_TENANT_USE_CASE,
    });

    logger.error(errorInstance);
    throw errorInstance;
  }

  logger.info(`creating tenant ${createNewTenantDto.tenant.name}`);
  const tenantId = await services.tenant.create(createNewTenantDto.tenant);
  logger.info(
    `new tenant created: name "${createNewTenantDto.tenant.name}" id "${tenantId}"`
  );

  logger.info(
    `creating account on tenant ${tenantId}:  ${createNewTenantDto.account.name}`
  );
  const accountId = await services.account.create(
    tenantId,
    createNewTenantDto.account
  );
  logger.info(`new account created on tenant ${tenantId}: id "${accountId}"`);

  const firstEnvironment = createNewTenantDto.environment ?? {
    name: 'default',
    customProperties: {},
  };

  logger.info(
    `creating environment on tenant ${tenantId}:  ${firstEnvironment.name}`
  );
  const tenantEnvironmentId = await services.tenantEnvironment.create(
    tenantId,
    firstEnvironment
  );
  logger.info(
    `new environment created on tenant ${tenantId}: id "${tenantEnvironmentId}"`
  );

  return { tenantId, accountId, tenantEnvironmentId };
}

export { createNewTenantUseCase };
