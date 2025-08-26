import { Knex } from 'knex';
import { BaseService } from '../../base-classes';
import { contexts } from '../../lib/contexts';
import { UnexpectedError, ValidationError } from '../../lib/errors';
import { BaseCustomError } from '../../lib/errors/base-custom-error.error';
import {
  createTenantEnvironmentDtoSchema,
  ICreateTenantEnvironmentDto,
  idSchema,
  IUpdateTenantEnvironmentDto,
  updateTenantEnvironmentDtoSchema,
} from './types/dto.type';
import { ITenantEnvironmentRepository } from './types/repository.type';
import { ITenantEnvironmentService } from './types/service.type';
import { ITenantEnvironment } from './types/tenant-environment.type';

export class TenantEnvironmentService
  extends BaseService
  implements ITenantEnvironmentService
{
  constructor(private readonly tenantRepository: ITenantEnvironmentRepository) {
    super('tenant-service');
  }

  async create(
    dto: ICreateTenantEnvironmentDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    const validationResult = createTenantEnvironmentDtoSchema.safeParse(dto);

    if (!validationResult.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...dto },
          errors: validationResult.error.issues,
        },
        context: contexts.TENANT_ENVIRONMENT_CREATE,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    try {
      const tenantId = await this.tenantRepository.create(dto, transaction);

      this.logger.info(`new tenant created: ${tenantId}`);

      return tenantId;
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

  async getById(id: string): Promise<ITenantEnvironment | undefined> {
    const isIdValid = idSchema.safeParse(id);

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: isIdValid.error.issues,
        },
        context: contexts.TENANT_ENVIRONMENT_GET_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantRepository.getById(id);
  }

  async deleteById(id: string): Promise<boolean> {
    const isIdValid = idSchema.safeParse(id);

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: isIdValid.error.issues,
        },
        context: contexts.TENANT_ENVIRONMENT_DELETE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantRepository.deleteById(id);
  }

  // @TODO: ensure that _id_  cant be sent in the dto so not to overwrite the actual id
  async updateById(
    id: string,
    dto: IUpdateTenantEnvironmentDto
  ): Promise<boolean> {
    const isIdValid = idSchema.safeParse(id);

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id, ...dto },
          errors: isIdValid.error.issues,
        },
        context: contexts.TENANT_ENVIRONMENT_UPDATE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid = updateTenantEnvironmentDtoSchema.safeParse(dto);

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id, ...dto },
          errors: isPayloadValid.error.issues,
        },
        context: contexts.TENANT_ENVIRONMENT_UPDATE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantRepository.updateById(id, dto);
  }
}
