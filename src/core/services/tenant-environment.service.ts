import { Knex } from 'knex';
import { BaseService } from '../../lib/base-classes';
import { contexts } from '../../lib/contexts';
import { UnexpectedError, ValidationError } from '../../lib/errors';
import { BaseCustomError } from '../../lib/errors/base-custom-error.error';
import { formatZodError } from '../../lib/utils/formatters';
import {
  ICreateTenantEnvironmentNoInternalPropertiesDto,
  IGetTenantEnvironmentDto,
  IUpdateTenantEnvironmentNonSensitivePropertiesDto,
  tenantEnvironmentCustomPropertiesOperationDtoSchema,
  updateTenantEnvironmentNonSensitivePropertiesDtoSchema,
} from '../types/tenant-environment/dto.type';
import { ITenantEnvironmentRepository } from '../types/tenant-environment/repository.type';
import { ITenantEnvironmentService } from '../types/tenant-environment/service.type';
import {
  ITenantEnvironment,
  tenantEnvironmentSchema,
} from '../types/tenant-environment/tenant-environment.type';
import { ITenant } from '../types/tenant/tenant.type';

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

    return this.tenantEnvironmentRepository.getById(id);
  }

  async getByIdAndTenantId(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId']
  ): Promise<IGetTenantEnvironmentDto | undefined> {
    this.logger.info(`getById: ${id}`);

    return this.tenantEnvironmentRepository.getByIdAndTenantId(id, tenantId);
  }

  async getByTenantId(
    tenantId: ITenantEnvironment['tenantId']
  ): Promise<IGetTenantEnvironmentDto[] | undefined> {
    this.logger.info(`getByTenantId: ${tenantId}`);

    return this.tenantEnvironmentRepository.getByTenantId(tenantId);
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

  async deleteByIdAndTenantId(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId']
  ): Promise<boolean> {
    this.logger.info(`deleteById: ${id}`);

    return this.tenantEnvironmentRepository.deleteByIdAndTenantId(id, tenantId);
  }

  async updateNonSensitivePropertiesByIdAndTenantId(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId'],
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

    return this.tenantEnvironmentRepository.updateByIdAndTenantId(
      id,
      tenantId,
      dto
    );
  }

  async setCustomPropertyByIdAndTenantId(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId'],
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

    return this.tenantEnvironmentRepository.setCustomPropertyByIdAndTenantId(
      id,
      tenantId,
      customProperties
    );
  }

  async deleteCustomPropertyByIdAndTenantId(
    id: ITenant['id'],
    tenantId: ITenantEnvironment['tenantId'],
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

    return this.tenantEnvironmentRepository.deleteCustomPropertyByIdAndTenantId(
      id,
      tenantId,
      customPropertyKey
    );
  }
}
