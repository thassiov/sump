import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { BaseService } from '../../lib/base-classes';
import { contexts } from '../../lib/contexts';
import { UnexpectedError, ValidationError } from '../../lib/errors';
import { BaseCustomError } from '../../lib/errors/base-custom-error.error';
import { formatZodError } from '../../lib/utils/formatters';
import {
  ICreateEnvironmentNoInternalPropertiesDto,
  IGetEnvironmentDto,
  IUpdateEnvironmentNonSensitivePropertiesDto,
  environmentCustomPropertiesOperationDtoSchema,
  updateEnvironmentNonSensitivePropertiesDtoSchema,
} from '../types/environment/dto.type';
import { IEnvironmentService } from '../types/environment/service.type';
import {
  IEnvironment,
  environmentSchema,
} from '../types/environment/environment.type';
import { ITenant } from '../types/tenant/tenant.type';
import { EnvironmentRepository } from '../repositories/environment.repository';

@Injectable()
export class EnvironmentService
  extends BaseService
  implements IEnvironmentService
{
  constructor(
    private readonly tenantEnvironmentRepository: EnvironmentRepository
  ) {
    super('environment-service');
  }

  async create(
    tenantId: ITenant['id'],
    dto: ICreateEnvironmentNoInternalPropertiesDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    this.logger.info(`create environment in tenant ${tenantId}`);

    try {
      const tenantEnvironmentId = await this.tenantEnvironmentRepository.create(
        { ...dto, customProperties: dto.customProperties ?? {}, tenantId },
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
        context: contexts.ENVIRONMENT_CREATE,
      });

      this.logger.error(errorInstance);

      throw errorInstance;
    }
  }

  async getById(
    id: IEnvironment['id']
  ): Promise<IGetEnvironmentDto | undefined> {
    this.logger.info(`getById: ${id}`);

    return this.tenantEnvironmentRepository.getById(id);
  }

  async getByIdAndTenantId(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId']
  ): Promise<IGetEnvironmentDto | undefined> {
    this.logger.info(`getById: ${id}`);

    return this.tenantEnvironmentRepository.getByIdAndTenantId(id, tenantId);
  }

  async getByTenantId(
    tenantId: IEnvironment['tenantId']
  ): Promise<IGetEnvironmentDto[] | undefined> {
    this.logger.info(`getByTenantId: ${tenantId}`);

    return this.tenantEnvironmentRepository.getByTenantId(tenantId);
  }

  async deleteById(id: IEnvironment['id']): Promise<boolean> {
    this.logger.info(`deleteById: ${id}`);

    const isIdValid = environmentSchema
      .pick({ id: true })
      .safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.ENVIRONMENT_DELETE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantEnvironmentRepository.deleteById(id);
  }

  async deleteByIdAndTenantId(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId']
  ): Promise<boolean> {
    this.logger.info(`deleteById: ${id}`);

    return this.tenantEnvironmentRepository.deleteByIdAndTenantId(id, tenantId);
  }

  async updateNonSensitivePropertiesByIdAndTenantId(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId'],
    dto: IUpdateEnvironmentNonSensitivePropertiesDto
  ): Promise<boolean> {
    this.logger.info(`updateNonSensitivePropertiesById: ${id}`);

    const isIdValid = environmentSchema
      .pick({ id: true })
      .safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context:
          contexts.ENVIRONMENT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid =
      updateEnvironmentNonSensitivePropertiesDtoSchema.safeParse(dto);

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...dto },
          errors: formatZodError(isPayloadValid.error.issues),
        },
        context:
          contexts.ENVIRONMENT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID,
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
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId'],
    customProperties: IEnvironment['customProperties']
  ): Promise<boolean> {
    this.logger.info(`setCustomPropertyById: ${id}`);
    const isIdValid = environmentSchema
      .pick({ id: true })
      .safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.ENVIRONMENT_SET_CUSTOM_PROPERTY_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid =
      environmentCustomPropertiesOperationDtoSchema.safeParse(customProperties);

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...customProperties },
          errors: formatZodError(isPayloadValid.error.issues),
        },
        context: contexts.ENVIRONMENT_SET_CUSTOM_PROPERTY_BY_ID,
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
    tenantId: IEnvironment['tenantId'],
    customPropertyKey: string
  ): Promise<boolean> {
    this.logger.info(`deleteCustomPropertyById: ${id}`);
    const isIdValid = environmentSchema
      .pick({ id: true })
      .safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.ENVIRONMENT_DELETE_CUSTOM_PROPERTY_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid =
      environmentCustomPropertiesOperationDtoSchema.keyType.safeParse(
        customPropertyKey
      );

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { customPropertyKey },
          errors: formatZodError(isPayloadValid.error.issues),
        },
        context: contexts.ENVIRONMENT_DELETE_CUSTOM_PROPERTY_BY_ID,
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
