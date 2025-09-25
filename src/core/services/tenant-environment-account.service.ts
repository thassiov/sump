import { Knex } from 'knex';
import { BaseService } from '../../lib/base-classes';
import { contexts } from '../../lib/contexts';
import { UnexpectedError, ValidationError } from '../../lib/errors';
import { BaseCustomError } from '../../lib/errors/base-custom-error.error';
import { formatZodError } from '../../lib/utils/formatters';
import {
  ICreateTenantEnvironmentAccountNoInternalPropertiesDto,
  IGetTenantEnvironmentAccountDto,
  IUpdateTenantEnvironmentAccountEmailDto,
  IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateTenantEnvironmentAccountPhoneDto,
  IUpdateTenantEnvironmentAccountUsernameDto,
} from '../types/tenant-environment-account/dto.type';
import { ITenantEnvironmentAccountRepository } from '../types/tenant-environment-account/repository.type';
import { ITenantEnvironmentAccountService } from '../types/tenant-environment-account/service.type';
import {
  ITenantEnvironmentAccount,
  tenantEnvironmentAccountSchema,
} from '../types/tenant-environment-account/tenant-environment-account.type';
import { ITenantEnvironment } from '../types/tenant-environment/tenant-environment.type';

export class TenantEnvironmentAccountService
  extends BaseService
  implements ITenantEnvironmentAccountService
{
  constructor(
    private readonly tenantEnvironmentAccountRepository: ITenantEnvironmentAccountRepository
  ) {
    super('tenant-environment-account-service');
  }

  // @NOTE: maybe the transaction argument must be called something else here
  async create(
    tenantEnvironmentId: ITenantEnvironment['id'],
    dto: ICreateTenantEnvironmentAccountNoInternalPropertiesDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    this.logger.info(
      `create tenant environment account in environment ${tenantEnvironmentId}`
    );
    try {
      const tenantEnvironmentAccountId =
        await this.tenantEnvironmentAccountRepository.create(
          {
            ...dto,
            phoneVerified: false,
            emailVerified: false,
            tenantEnvironmentId,
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
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE,
      });

      this.logger.error(errorInstance);

      throw errorInstance;
    }
  }

  async getById(
    id: ITenantEnvironmentAccount['id']
  ): Promise<IGetTenantEnvironmentAccountDto | undefined> {
    this.logger.info(`getById: ${id}`);

    return this.tenantEnvironmentAccountRepository.getById(id);
  }

  async getByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId']
  ): Promise<IGetTenantEnvironmentAccountDto | undefined> {
    this.logger.info(`getById: ${id}`);

    return this.tenantEnvironmentAccountRepository.getByIdAndTenantEnvironmentId(
      id,
      tenantEnvironmentId
    );
  }

  async deleteById(id: ITenantEnvironmentAccount['id']): Promise<boolean> {
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
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_DELETE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantEnvironmentAccountRepository.deleteById(id);
  }

  async deleteByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId']
  ): Promise<boolean> {
    this.logger.info(`deleteById: ${id}`);

    return this.tenantEnvironmentAccountRepository.deleteByIdAndTenantEnvironmentId(
      id,
      tenantEnvironmentId
    );
  }

  async updateNonSensitivePropertiesByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto
  ): Promise<boolean> {
    this.logger.info(`updateNonSensitivePropertiesById: ${id}`);

    return this.tenantEnvironmentAccountRepository.updateByIdAndTenantEnvironmentId(
      id,
      tenantEnvironmentId,
      dto
    );
  }

  async updateEmailByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: IUpdateTenantEnvironmentAccountEmailDto
  ): Promise<boolean> {
    this.logger.info(`updateEmailById: ${id}`);

    return this.tenantEnvironmentAccountRepository.updateByIdAndTenantEnvironmentId(
      id,
      tenantEnvironmentId,
      dto
    );
  }

  async updateUsernameByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: IUpdateTenantEnvironmentAccountUsernameDto
  ): Promise<boolean> {
    this.logger.info(`updateUsernameById: ${id}`);

    return this.tenantEnvironmentAccountRepository.updateByIdAndTenantEnvironmentId(
      id,
      tenantEnvironmentId,
      dto
    );
  }

  async updatePhoneByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: IUpdateTenantEnvironmentAccountPhoneDto
  ): Promise<boolean> {
    this.logger.info(`updatePhoneById: ${id}`);

    return this.tenantEnvironmentAccountRepository.updateByIdAndTenantEnvironmentId(
      id,
      tenantEnvironmentId,
      dto
    );
  }

  async setCustomPropertyByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    customProperties: ITenantEnvironmentAccount['customProperties']
  ): Promise<boolean> {
    this.logger.info(`setCustomPropertyById: ${id}`);

    return this.tenantEnvironmentAccountRepository.setCustomPropertyByIdAndTenantEnvironmentId(
      id,
      tenantEnvironmentId,
      customProperties
    );
  }

  async deleteCustomPropertyByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    customPropertyKey: string
  ): Promise<boolean> {
    this.logger.info(`deleteCustomPropertyById: ${id}`);

    return this.tenantEnvironmentAccountRepository.deleteCustomPropertyByIdAndTenantEnvironmentId(
      id,
      tenantEnvironmentId,
      customPropertyKey
    );
  }
}
