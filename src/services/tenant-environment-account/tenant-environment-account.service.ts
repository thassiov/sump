import { Knex } from 'knex';
import { BaseService } from '../../base-classes';
import { contexts } from '../../lib/contexts';
import { UnexpectedError, ValidationError } from '../../lib/errors';
import { BaseCustomError } from '../../lib/errors/base-custom-error.error';
import {
  createTenantEnvironmentAccountDtoSchema,
  ICreateTenantEnvironmentAccountDto,
  idSchema,
  IUpdateTenantEnvironmentAccountDto,
  updateTenantEnvironmentAccountDtoSchema,
} from './types/dto.type';
import { ITenantEnvironmentAccountRepository } from './types/repository.type';
import { ITenantEnvironmentAccountService } from './types/service.type';
import { ITenantEnvironmentAccount } from './types/tenant-environment-account.type';

export class TenantEnvironmentAccountService
  extends BaseService
  implements ITenantEnvironmentAccountService
{
  constructor(
    private readonly accountRepository: ITenantEnvironmentAccountRepository
  ) {
    super('account-service');
  }

  // @NOTE: maybe the transaction argument must be called something else here
  async create(
    dto: ICreateTenantEnvironmentAccountDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    // @TODO: move this validation to a api middleware. this service is suposed to receive the correct data
    const validationResult =
      createTenantEnvironmentAccountDtoSchema.safeParse(dto);

    if (!validationResult.success) {
      const errorInstance = new ValidationError({
        details: {
          input: dto,
          errors: validationResult.error.issues,
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    try {
      const accountId = await this.accountRepository.create(dto, transaction);

      this.logger.info(`new account created: ${accountId}`);

      return accountId;
    } catch (error) {
      if (error instanceof BaseCustomError) {
        this.logger.error(error);
        throw error;
      }

      const errorInstance = new UnexpectedError({
        details: {
          input: dto,
        },
        cause: error as Error,
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE,
      });

      this.logger.error(errorInstance);

      throw errorInstance;
    }
  }

  async getById(id: string): Promise<ITenantEnvironmentAccount | undefined> {
    const isIdValid = idSchema.safeParse(id);

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: isIdValid.error.issues,
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_GET_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.accountRepository.getById(id);
  }

  async deleteById(id: string): Promise<boolean> {
    const isIdValid = idSchema.safeParse(id);

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: isIdValid.error.issues,
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_DELETE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.accountRepository.deleteById(id);
  }

  async updateById(
    id: string,
    dto: IUpdateTenantEnvironmentAccountDto
  ): Promise<boolean> {
    const isIdValid = idSchema.safeParse(id);

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: isIdValid.error.issues,
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid =
      updateTenantEnvironmentAccountDtoSchema.safeParse(dto);

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id, ...dto },
          errors: isPayloadValid.error.issues,
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.accountRepository.updateById(id, dto);
  }
}
