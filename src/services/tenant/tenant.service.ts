import { Knex } from 'knex';
import { BaseService } from '../../base-classes';
import { contexts } from '../../lib/contexts';
import { UnexpectedError, ValidationError } from '../../lib/errors';
import { BaseCustomError } from '../../lib/errors/base-custom-error.error';
import {
  createTenantDtoSchema,
  ICreateTenantDto,
  idSchema,
  IUpdateTenantDto,
  updateTenantDtoSchema,
} from './types/dto.type';
import { ITenantRepository } from './types/repository.type';
import { ITenantService } from './types/service.type';
import { ITenant } from './types/tenant.type';

export class TenantService extends BaseService implements ITenantService {
  constructor(private readonly tenantRepository: ITenantRepository) {
    super('tenant-service');
  }

  async createTenant(
    newTenant: ICreateTenantDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    const validationResult = createTenantDtoSchema.safeParse(newTenant);

    if (!validationResult.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...newTenant },
          errors: validationResult.error.issues,
        },
        context: contexts.TENANT_CREATE,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    try {
      const tenantId = await this.tenantRepository.create(
        newTenant,
        transaction
      );

      this.logger.info(`new tenant created: ${tenantId}`);

      return tenantId;
    } catch (error) {
      if (error instanceof BaseCustomError) {
        this.logger.error(error);
        throw error;
      }

      const errorInstance = new UnexpectedError({
        details: {
          input: { ...newTenant },
        },
        cause: error as Error,
        context: contexts.TENANT_CREATE,
      });

      this.logger.error(errorInstance);

      throw errorInstance;
    }
  }

  async getTenantById(tenantId: string): Promise<ITenant | undefined> {
    const isIdValid = idSchema.safeParse(tenantId);

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { tenantId },
          errors: isIdValid.error.issues,
        },
        context: contexts.TENANT_GET_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantRepository.getTenantById(tenantId);
  }

  async removeTenantById(tenantId: string): Promise<boolean> {
    const isIdValid = idSchema.safeParse(tenantId);

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { tenantId },
          errors: isIdValid.error.issues,
        },
        context: contexts.TENANT_REMOVE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantRepository.removeTenantById(tenantId);
  }

  async updateTenantById(
    tenantId: string,
    updateTenantDto: IUpdateTenantDto
  ): Promise<boolean> {
    const isIdValid = idSchema.safeParse(tenantId);

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { tenantId, ...updateTenantDto },
          errors: isIdValid.error.issues,
        },
        context: contexts.TENANT_UPDATE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid = updateTenantDtoSchema.safeParse(updateTenantDto);

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { tenantId, ...updateTenantDto },
          errors: isPayloadValid.error.issues,
        },
        context: contexts.TENANT_UPDATE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantRepository.updateTenantById(tenantId, updateTenantDto);
  }
}
