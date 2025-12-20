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
  ICreateTenantEnvironmentDto,
  IGetTenantEnvironmentDto,
  ITenantEnvironmentCustomPropertiesOperationDtoSchema,
  IUpdateTenantEnvironmentNonSensitivePropertiesDto,
  SetTenantEnvironmentCustomPropertiesUseCaseDtoResult,
  tenantEnvironmentCustomPropertiesOperationDtoSchema,
  updateTenantEnvironmentNonSensitivePropertiesDtoSchema,
  UpdateTenantEnvironmentNonSensitivePropertiesUseCaseDtoResult,
} from '../types/tenant-environment/dto.type';
import {
  ITenantEnvironment,
  tenantEnvironmentSchema,
} from '../types/tenant-environment/tenant-environment.type';
import { TenantEnvironmentUseCaseServices } from '../types/tenant-environment/use-case.type';

class TenantEnvironmentUseCase extends BaseUseCase {
  protected services: TenantEnvironmentUseCaseServices;
  constructor(services: TenantEnvironmentUseCaseServices) {
    super('tenant-environment-use-case');
    this.services = services;
  }

  async createNewEnvironment(
    tenantId: ITenantEnvironment['tenantId'],
    dto: ICreateTenantEnvironmentDto
  ): Promise<CreateNewTenantEnvironmentUseCaseDtoResult> {
    this.validateTenantId(tenantId, contexts.TENANT_ENVIRONMENT_CREATE);
    this.validateDto(
      dto,
      createTenantEnvironmentDtoSchema,
      contexts.TENANT_ENVIRONMENT_CREATE
    );

    return this.services.tenantEnvironment.create(tenantId, dto);
  }

  async getEnvironmentByIdAndTenantId(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId']
  ): Promise<IGetTenantEnvironmentDto | undefined> {
    this.validateTenantEnvironmentId(id, contexts.TENANT_ENVIRONMENT_GET_BY_ID);
    this.validateTenantId(tenantId, contexts.TENANT_ENVIRONMENT_GET_BY_ID);

    return this.services.tenantEnvironment.getByIdAndTenantId(id, tenantId);
  }

  async deleteEnvironmentByIdAndTenantId(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId']
  ): Promise<DeleteTenantEnvironmentUseCaseDtoResult> {
    this.validateTenantEnvironmentId(
      id,
      contexts.TENANT_ENVIRONMENT_DELETE_BY_ID
    );
    this.validateTenantId(tenantId, contexts.TENANT_ENVIRONMENT_DELETE_BY_ID);

    return this.services.tenantEnvironment.deleteByIdAndTenantId(id, tenantId);
  }

  async updateEnvironmentNonSensitivePropertiesByIdAndTenantId(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId'],
    dto: IUpdateTenantEnvironmentNonSensitivePropertiesDto
  ): Promise<UpdateTenantEnvironmentNonSensitivePropertiesUseCaseDtoResult> {
    this.validateTenantEnvironmentId(
      id,
      contexts.TENANT_ENVIRONMENT_DELETE_BY_ID
    );
    this.validateTenantId(tenantId, contexts.TENANT_ENVIRONMENT_DELETE_BY_ID);
    this.validateDto(
      dto,
      updateTenantEnvironmentNonSensitivePropertiesDtoSchema,
      contexts.TENANT_ENVIRONMENT_DELETE_BY_ID
    );

    return this.services.tenantEnvironment.updateNonSensitivePropertiesByIdAndTenantId(
      id,
      tenantId,
      dto
    );
  }

  async setEnvironmentCustomPropertyByIdAndTenantId(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId'],
    dto: ITenantEnvironmentCustomPropertiesOperationDtoSchema
  ): Promise<SetTenantEnvironmentCustomPropertiesUseCaseDtoResult> {
    this.validateTenantEnvironmentId(
      id,
      contexts.TENANT_ENVIRONMENT_DELETE_BY_ID
    );
    this.validateTenantId(tenantId, contexts.TENANT_ENVIRONMENT_DELETE_BY_ID);
    this.validateDto(
      dto,
      tenantEnvironmentCustomPropertiesOperationDtoSchema,
      contexts.TENANT_ENVIRONMENT_DELETE_BY_ID
    );

    return this.services.tenantEnvironment.setCustomPropertyByIdAndTenantId(
      id,
      tenantId,
      dto
    );
  }

  async deleteEnvironmentCustomPropertyByIdAndTenantId(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId'],
    customPropertyKey: string
  ): Promise<DeleteTenantEnvironmentCustomPropertiesUseCaseDtoResult> {
    this.validateTenantEnvironmentId(
      id,
      contexts.TENANT_ENVIRONMENT_DELETE_BY_ID
    );
    this.validateTenantId(tenantId, contexts.TENANT_ENVIRONMENT_DELETE_BY_ID);
    this.validateDto(
      customPropertyKey,
      z.string(),
      contexts.TENANT_ENVIRONMENT_DELETE_BY_ID
    );

    return this.services.tenantEnvironment.deleteCustomPropertyByIdAndTenantId(
      id,
      tenantId,
      customPropertyKey
    );
  }

  private validateTenantEnvironmentId(
    tenantEnvironmentId: unknown,
    context: keyof typeof contexts
  ): void {
    const isIdValid = tenantEnvironmentSchema
      .pick({ id: true })
      .safeParse({ id: tenantEnvironmentId });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { tenantEnvironmentId },
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

export { TenantEnvironmentUseCase };
