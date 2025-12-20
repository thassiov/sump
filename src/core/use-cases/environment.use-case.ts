import z from 'zod';
import { BaseUseCase } from '../../lib/base-classes';
import { contexts } from '../../lib/contexts';
import { ValidationError } from '../../lib/errors';
import { formatZodError } from '../../lib/utils/formatters';
import {
  CreateNewTenantEnvironmentUseCaseDtoResult,
  createTenantEnvironmentDtoSchema,
  DeleteTenantEnvironmentCustomPropertiesUseCaseDtoResult,
  DeleteTenantEnvironmentUseCaseDtoResult,
  ICreateEnvironmentDto,
  IGetEnvironmentDto,
  IEnvironmentCustomPropertiesOperationDtoSchema,
  IUpdateEnvironmentNonSensitivePropertiesDto,
  SetTenantEnvironmentCustomPropertiesUseCaseDtoResult,
  tenantEnvironmentCustomPropertiesOperationDtoSchema,
  updateTenantEnvironmentNonSensitivePropertiesDtoSchema,
  UpdateTenantEnvironmentNonSensitivePropertiesUseCaseDtoResult,
} from '../types/environment/dto.type';
import {
  IEnvironment,
  tenantEnvironmentSchema,
} from '../types/environment/environment.type';
import { EnvironmentUseCaseServices } from '../types/environment/use-case.type';

class EnvironmentUseCase extends BaseUseCase {
  protected services: EnvironmentUseCaseServices;
  constructor(services: EnvironmentUseCaseServices) {
    super('environment-use-case');
    this.services = services;
  }

  async createNewEnvironment(
    tenantId: IEnvironment['tenantId'],
    dto: ICreateEnvironmentDto
  ): Promise<CreateNewTenantEnvironmentUseCaseDtoResult> {
    this.validateTenantId(tenantId, contexts.ENVIRONMENT_CREATE);
    this.validateDto(
      dto,
      createTenantEnvironmentDtoSchema,
      contexts.ENVIRONMENT_CREATE
    );

    return this.services.tenantEnvironment.create(tenantId, dto);
  }

  async getEnvironmentByIdAndTenantId(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId']
  ): Promise<IGetEnvironmentDto | undefined> {
    this.validateTenantEnvironmentId(id, contexts.ENVIRONMENT_GET_BY_ID);
    this.validateTenantId(tenantId, contexts.ENVIRONMENT_GET_BY_ID);

    return this.services.tenantEnvironment.getByIdAndTenantId(id, tenantId);
  }

  async deleteEnvironmentByIdAndTenantId(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId']
  ): Promise<DeleteTenantEnvironmentUseCaseDtoResult> {
    this.validateTenantEnvironmentId(
      id,
      contexts.ENVIRONMENT_DELETE_BY_ID
    );
    this.validateTenantId(tenantId, contexts.ENVIRONMENT_DELETE_BY_ID);

    return this.services.tenantEnvironment.deleteByIdAndTenantId(id, tenantId);
  }

  async updateEnvironmentNonSensitivePropertiesByIdAndTenantId(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId'],
    dto: IUpdateEnvironmentNonSensitivePropertiesDto
  ): Promise<UpdateTenantEnvironmentNonSensitivePropertiesUseCaseDtoResult> {
    this.validateTenantEnvironmentId(
      id,
      contexts.ENVIRONMENT_DELETE_BY_ID
    );
    this.validateTenantId(tenantId, contexts.ENVIRONMENT_DELETE_BY_ID);
    this.validateDto(
      dto,
      updateTenantEnvironmentNonSensitivePropertiesDtoSchema,
      contexts.ENVIRONMENT_DELETE_BY_ID
    );

    return this.services.tenantEnvironment.updateNonSensitivePropertiesByIdAndTenantId(
      id,
      tenantId,
      dto
    );
  }

  async setEnvironmentCustomPropertyByIdAndTenantId(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId'],
    dto: IEnvironmentCustomPropertiesOperationDtoSchema
  ): Promise<SetTenantEnvironmentCustomPropertiesUseCaseDtoResult> {
    this.validateTenantEnvironmentId(
      id,
      contexts.ENVIRONMENT_DELETE_BY_ID
    );
    this.validateTenantId(tenantId, contexts.ENVIRONMENT_DELETE_BY_ID);
    this.validateDto(
      dto,
      tenantEnvironmentCustomPropertiesOperationDtoSchema,
      contexts.ENVIRONMENT_DELETE_BY_ID
    );

    return this.services.tenantEnvironment.setCustomPropertyByIdAndTenantId(
      id,
      tenantId,
      dto
    );
  }

  async deleteEnvironmentCustomPropertyByIdAndTenantId(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId'],
    customPropertyKey: string
  ): Promise<DeleteTenantEnvironmentCustomPropertiesUseCaseDtoResult> {
    this.validateTenantEnvironmentId(
      id,
      contexts.ENVIRONMENT_DELETE_BY_ID
    );
    this.validateTenantId(tenantId, contexts.ENVIRONMENT_DELETE_BY_ID);
    this.validateDto(
      customPropertyKey,
      z.string(),
      contexts.ENVIRONMENT_DELETE_BY_ID
    );

    return this.services.tenantEnvironment.deleteCustomPropertyByIdAndTenantId(
      id,
      tenantId,
      customPropertyKey
    );
  }

  private validateTenantEnvironmentId(
    environmentId: unknown,
    context: keyof typeof contexts
  ): void {
    const isIdValid = tenantEnvironmentSchema
      .pick({ id: true })
      .safeParse({ id: environmentId });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { environmentId },
          errors: formatZodError(isIdValid.error.issues),
        },
        context,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }
  }

  private validateTenantId(
    tenantId: unknown,
    context: keyof typeof contexts
  ): void {
    const isTenantIdValid = tenantEnvironmentSchema
      .pick({ tenantId: true })
      .safeParse({ tenantId });

    if (!isTenantIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { tenantId },
          errors: formatZodError(isTenantIdValid.error.issues),
        },
        context,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }
  }

  private validateDto(
    dto: unknown,
    schema: z.ZodType,
    context: keyof typeof contexts
  ): void {
    const isDtoValid = schema.safeParse(dto);

    if (!isDtoValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: dto,
          errors: formatZodError(isDtoValid.error.issues),
        },
        context,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }
  }
}

export { EnvironmentUseCase };
