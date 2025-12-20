import { Knex } from 'knex';
import { BaseService } from '../../lib/base-classes';
import { contexts } from '../../lib/contexts';
import { UnexpectedError, ValidationError } from '../../lib/errors';
import { BaseCustomError } from '../../lib/errors/base-custom-error.error';
import { formatZodError } from '../../lib/utils/formatters';
import {
  ICreateTenantEnvironmentAccountNoInternalPropertiesDto,
  IGetEnvironmentAccountDto,
  IUpdateTenantEnvironmentAccountEmailDto,
  IUpdateEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateTenantEnvironmentAccountPhoneDto,
  IUpdateTenantEnvironmentAccountUsernameDto,
} from '../types/environment-account/dto.type';
import { IEnvironmentAccountRepository } from '../types/tenant-environment-account/repository.type';
import { IEnvironmentAccountService } from '../types/environment-account/service.type';
import {
  IEnvironmentAccount,
  tenantEnvironmentAccountSchema,
} from '../types/environment-account/environment-account.type';
import { ITenantEnvironment } from '../types/tenant-environment/tenant-environment.type';

export class EnvironmentAccountService
  extends BaseService
  implements IEnvironmentAccountService
{
  constructor(
    private readonly tenantEnvironmentAccountRepository: IEnvironmentAccountRepository
  ) {
    super('environment-account-service');
  }

  // @NOTE: maybe the transaction argument must be called something else here
  async create(
    environmentId: ITenantEnvironment['id'],
    dto: ICreateTenantEnvironmentAccountNoInternalPropertiesDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    this.logger.info(
      `create tenant environment account in environment ${environmentId}`
    );
    try {
      const tenantEnvironmentAccountId =
        await this.tenantEnvironmentAccountRepository.create(
          {
            ...dto,
            phoneVerified: false,
            emailVerified: false,
            environmentId,
          },
          transaction
        );

      this.logger.info(
        `new tenant environment account created: ${tenantEnvironmentAccountId}`
      );

      return tenantEnvironmentAccountId;
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
        context: contexts.ENVIRONMENT_ACCOUNT_CREATE,
      });

      this.logger.error(errorInstance);

      throw errorInstance;
    }
  }

  async getById(
    id: IEnvironmentAccount['id']
  ): Promise<IGetEnvironmentAccountDto | undefined> {
    this.logger.info(`getById: ${id}`);

    return this.tenantEnvironmentAccountRepository.getById(id);
  }

  async getByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ): Promise<IGetEnvironmentAccountDto | undefined> {
    this.logger.info(`getById: ${id}`);

    return this.tenantEnvironmentAccountRepository.getByIdAndTenantEnvironmentId(
      id,
      environmentId
    );
  }

  async deleteById(id: IEnvironmentAccount['id']): Promise<boolean> {
    this.logger.info(`deleteById: ${id}`);

    const isIdValid = tenantEnvironmentAccountSchema
      .pick({ id: true })
      .safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.ENVIRONMENT_ACCOUNT_DELETE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantEnvironmentAccountRepository.deleteById(id);
  }

  async deleteByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ): Promise<boolean> {
    this.logger.info(`deleteById: ${id}`);

    return this.tenantEnvironmentAccountRepository.deleteByIdAndTenantEnvironmentId(
      id,
      environmentId
    );
  }

  async updateNonSensitivePropertiesByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateEnvironmentAccountNonSensitivePropertiesDto
  ): Promise<boolean> {
    this.logger.info(`updateNonSensitivePropertiesById: ${id}`);

    return this.tenantEnvironmentAccountRepository.updateByIdAndTenantEnvironmentId(
      id,
      environmentId,
      dto
    );
  }

  async updateEmailByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateTenantEnvironmentAccountEmailDto
  ): Promise<boolean> {
    this.logger.info(`updateEmailById: ${id}`);

    return this.tenantEnvironmentAccountRepository.updateByIdAndTenantEnvironmentId(
      id,
      environmentId,
      dto
    );
  }

  async updateUsernameByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateTenantEnvironmentAccountUsernameDto
  ): Promise<boolean> {
    this.logger.info(`updateUsernameById: ${id}`);

    return this.tenantEnvironmentAccountRepository.updateByIdAndTenantEnvironmentId(
      id,
      environmentId,
      dto
    );
  }

  async updatePhoneByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateTenantEnvironmentAccountPhoneDto
  ): Promise<boolean> {
    this.logger.info(`updatePhoneById: ${id}`);

    return this.tenantEnvironmentAccountRepository.updateByIdAndTenantEnvironmentId(
      id,
      environmentId,
      dto
    );
  }

  async setCustomPropertyByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    customProperties: IEnvironmentAccount['customProperties']
  ): Promise<boolean> {
    this.logger.info(`setCustomPropertyById: ${id}`);

    return this.tenantEnvironmentAccountRepository.setCustomPropertyByIdAndTenantEnvironmentId(
      id,
      environmentId,
      customProperties
    );
  }

  async deleteCustomPropertyByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    customPropertyKey: string
  ): Promise<boolean> {
    this.logger.info(`deleteCustomPropertyById: ${id}`);

    return this.tenantEnvironmentAccountRepository.deleteCustomPropertyByIdAndTenantEnvironmentId(
      id,
      environmentId,
      customPropertyKey
    );
  }
}
