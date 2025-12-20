import { BaseUseCase } from '../../lib/base-classes';
import { contexts } from '../../lib/contexts';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../lib/errors';
import { formatZodError } from '../../lib/utils/formatters';
import { ITenantAccountUserDefinedIdentification } from '../types/tenant-account/dto.type';
import {
  CreateNewTenantUseCaseDto,
  createNewTenantUseCaseDtoSchema,
  CreateNewTenantUseCaseResultDto,
  DeleteCustomPropertyByTenantIdUseCaseResultDto,
  DeleteTenantByIdUseCaseResultDto,
  GetAccountsByTenantIdSUseCaseResultDto,
  GetTenantByIdUseCaseResultDto,
  IUpdateTenantNonSensitivePropertiesDto,
  SetCustomPropertyByTenantIdUseCaseResultDto,
  UpdateNonSensitivePropertiesByTenantIdUseCaseResultDto,
} from '../types/tenant/dto.type';
import { ITenant, tenantSchema } from '../types/tenant/tenant.type';
import { TenantUseCaseServices } from '../types/tenant/use-case.type';

class TenantUseCase extends BaseUseCase {
  protected services: TenantUseCaseServices;
  constructor(services: TenantUseCaseServices) {
    super('tenant-use-case');
    this.services = services;
  }

  async createNewTenant(
    createNewTenantDto: CreateNewTenantUseCaseDto
  ): Promise<CreateNewTenantUseCaseResultDto> {
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

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const { email, phone, username } = createNewTenantDto.account;

    const hits = await this.services.tenantAccount.getByUserDefinedIdentification({
      email,
      phone,
      username,
    });

    if (hits) {
      const errorEntries = [{ email }, { phone }, { username }]
        .map((udi) => {
          const [key, value] = Object.entries(udi)[0] as [
            keyof ITenantAccountUserDefinedIdentification,
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

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    this.logger.info(`creating tenant ${createNewTenantDto.tenant.name}`);
    const tenantId = await this.services.tenant.create(
      createNewTenantDto.tenant
    );
    this.logger.info(
      `new tenant created: name "${createNewTenantDto.tenant.name}" id "${tenantId}"`
    );

    this.logger.info(
      `creating account on tenant ${tenantId}:  ${createNewTenantDto.account.name}`
    );
    const accountId = await this.services.tenantAccount.create(
      tenantId,
      createNewTenantDto.account
    );
    this.logger.info(
      `new account created on tenant ${tenantId}: id "${accountId}"`
    );

    const firstEnvironment = createNewTenantDto.environment ?? {
      name: 'default',
      customProperties: {},
    };

    this.logger.info(
      `creating environment on tenant ${tenantId}:  ${firstEnvironment.name}`
    );
    const environmentId = await this.services.environment.create(
      tenantId,
      firstEnvironment
    );
    this.logger.info(
      `new environment created on tenant ${tenantId}: id "${environmentId}"`
    );

    return { tenantId, accountId, environmentId };
  }

  async deleteTenantById(
    id: ITenant['id']
  ): Promise<DeleteTenantByIdUseCaseResultDto> {
    const isIdValid = tenantSchema.pick({ id: true }).safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.TENANT_DELETE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.services.tenant.deleteById(id);
  }

  async getTenantById(
    id: ITenant['id']
  ): Promise<GetTenantByIdUseCaseResultDto> {
    const isIdValid = tenantSchema.pick({ id: true }).safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.TENANT_GET_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const tenant = await this.services.tenant.getById(id);

    if (!tenant) {
      throw new NotFoundError({
        context: contexts.TENANT_GET_BY_ID,
        details: {
          input: { id },
        },
      });
    }

    const environments =
      await this.services.environment.getByTenantId(id);

    return { ...tenant, environments: environments ?? [] };
  }

  async getAccountsByTenantId(
    id: ITenant['id']
  ): Promise<GetAccountsByTenantIdSUseCaseResultDto> {
    const isIdValid = tenantSchema.pick({ id: true }).safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.TENANT_GET_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const tenant = await this.services.tenant.getById(id);

    if (!tenant) {
      throw new NotFoundError({
        // @TODO: add 'get accounts by tenant id' context
        // context: contexts.tenantget,
        details: {
          input: { id },
        },
      });
    }

    return this.services.tenantAccount.getByTenantId(id);
  }

  async deleteCustomPropertyByTenantIdUseCase(
    id: ITenant['id'],
    customPropertyKey: string
  ): Promise<DeleteCustomPropertyByTenantIdUseCaseResultDto> {
    const isIdValid = tenantSchema.pick({ id: true }).safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.TENANT_DELETE_CUSTOM_PROPERTY_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.services.tenant.deleteCustomPropertyById(id, customPropertyKey);
  }

  async setCustomPropertyByTenantIdUseCase(
    id: ITenant['id'],
    customProperty: ITenant['customProperties']
  ): Promise<SetCustomPropertyByTenantIdUseCaseResultDto> {
    const isIdValid = tenantSchema.pick({ id: true }).safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.TENANT_SET_CUSTOM_PROPERTY_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.services.tenant.setCustomPropertyById(id, customProperty);
  }

  async updateNonSensitivePropertiesByIdUseCase(
    id: ITenant['id'],
    dto: IUpdateTenantNonSensitivePropertiesDto
  ): Promise<UpdateNonSensitivePropertiesByTenantIdUseCaseResultDto> {
    const isIdValid = tenantSchema.pick({ id: true }).safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.TENANT_SET_CUSTOM_PROPERTY_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.services.tenant.updateNonSensitivePropertiesById(id, dto);
  }
}

export { TenantUseCase };
