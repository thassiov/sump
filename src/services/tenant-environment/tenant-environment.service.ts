import { Knex } from 'knex';
import { BaseService } from '../../base-classes';
import { contexts } from '../../lib/contexts';
import { UnexpectedError, ValidationError } from '../../lib/errors';
import { BaseCustomError } from '../../lib/errors/base-custom-error.error';
import { formatZodError } from '../../lib/utils/formatters';
import { ITenant } from '../tenant/types/tenant.type';
import {
  createTenantEnvironmentDtoSchema,
  createTenantEnvironmentNoInternalPropertiesDtoSchema,
  ICreateTenantEnvironmentNoInternalPropertiesDto,
  IGetTenantEnvironmentDto,
  IUpdateTenantEnvironmentNonSensitivePropertiesDto,
  tenantEnvironmentCustomPropertiesOperationDtoSchema,
  updateTenantEnvironmentNonSensitivePropertiesDtoSchema,
} from './types/dto.type';
import { ITenantEnvironmentRepository } from './types/repository.type';
import { ITenantEnvironmentService } from './types/service.type';
import {
  ITenantEnvironment,
  tenantEnvironmentSchema,
} from './types/tenant-environment.type';

export class TenantEnvironmentService
  extends BaseService
  implements ITenantEnvironmentService
{
  constructor(
    private readonly tenantEnvironmentRepository: ITenantEnvironmentRepository
  ) {
    super('tenant-environment-service');
  }

  async create(
    tenantId: ITenant['id'],
    dto: ICreateTenantEnvironmentNoInternalPropertiesDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    this.logger.info(`create environment in tenant ${tenantId}`);

    const isTenantIdValid = createTenantEnvironmentDtoSchema
      .pick({ tenantId: true })
      .safeParse({ tenantId });

    if (!isTenantIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { tenantId },
          errors: formatZodError(isTenantIdValid.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_CREATE,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const validationResult =
      createTenantEnvironmentNoInternalPropertiesDtoSchema.safeParse(dto);

    if (!validationResult.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...dto },
          errors: formatZodError(validationResult.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_CREATE,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    try {
      const tenantEnvironmentId = await this.tenantEnvironmentRepository.create(
        { ...dto, tenantId },
        transaction
      );

      this.logger.info(`new environment created: ${tenantEnvironmentId}`);

      return tenantEnvironmentId;
    } catch (error) {
      if (error instanceof BaseCustomError) {
        this.logger.error(error);
        throw error;
      }

      const errorInstance = new UnexpectedError({
        details: {
          input: { ...dto },
        },
        cause: error as Error,
        context: contexts.TENANT_ENVIRONMENT_CREATE,
      });

      this.logger.error(errorInstance);

      throw errorInstance;
    }
  }

  async getById(
    id: ITenantEnvironment['id']
  ): Promise<IGetTenantEnvironmentDto | undefined> {
    this.logger.info(`getById: ${id}`);

    const isIdValid = tenantEnvironmentSchema
      .pick({ id: true })
      .safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_GET_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantEnvironmentRepository.getById(id);
  }

  async deleteById(id: ITenantEnvironment['id']): Promise<boolean> {
    this.logger.info(`deleteById: ${id}`);

    const isIdValid = tenantEnvironmentSchema
      .pick({ id: true })
      .safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_DELETE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantEnvironmentRepository.deleteById(id);
  }

  async updateNonSensitivePropertiesById(
    id: ITenantEnvironment['id'],
    dto: IUpdateTenantEnvironmentNonSensitivePropertiesDto
  ): Promise<boolean> {
    this.logger.info(`updateNonSensitivePropertiesById: ${id}`);

    const isIdValid = tenantEnvironmentSchema
      .pick({ id: true })
      .safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context:
          contexts.TENANT_ENVIRONMENT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid =
      updateTenantEnvironmentNonSensitivePropertiesDtoSchema.safeParse(dto);

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...dto },
          errors: formatZodError(isPayloadValid.error.issues),
        },
        context:
          contexts.TENANT_ENVIRONMENT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantEnvironmentRepository.updateById(id, dto);
  }

  async setCustomPropertyById(
    id: ITenantEnvironment['id'],
    customProperties: ITenantEnvironment['customProperties']
  ): Promise<boolean> {
    this.logger.info(`setCustomPropertyById: ${id}`);
    const isIdValid = tenantEnvironmentSchema
      .pick({ id: true })
      .safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_SET_CUSTOM_PROPERTY_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid =
      tenantEnvironmentCustomPropertiesOperationDtoSchema.safeParse({
        customProperties,
      });

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...customProperties },
          errors: formatZodError(isPayloadValid.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_SET_CUSTOM_PROPERTY_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantEnvironmentRepository.setCustomPropertyById(
      id,
      customProperties
    );
  }

  async deleteCustomPropertyById(
    id: ITenant['id'],
    customPropertyKey: string
  ): Promise<boolean> {
    this.logger.info(`deleteCustomPropertyById: ${id}`);
    const isIdValid = tenantEnvironmentSchema
      .pick({ id: true })
      .safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_DELETE_CUSTOM_PROPERTY_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid =
      tenantEnvironmentCustomPropertiesOperationDtoSchema.keyType.safeParse(
        customPropertyKey
      );

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { customPropertyKey },
          errors: formatZodError(isPayloadValid.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_DELETE_CUSTOM_PROPERTY_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantEnvironmentRepository.deleteCustomPropertyById(
      id,
      customPropertyKey
    );
  }
}
