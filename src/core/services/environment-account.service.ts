import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { BaseService } from '../../lib/base-classes';
import { contexts } from '../../lib/contexts';
import { UnexpectedError, ValidationError } from '../../lib/errors';
import { BaseCustomError } from '../../lib/errors/base-custom-error.error';
import { formatZodError } from '../../lib/utils/formatters';
import {
  ICreateEnvironmentAccountNoInternalPropertiesDto,
  IGetEnvironmentAccountDto,
  IUpdateEnvironmentAccountEmailDto,
  IUpdateEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateEnvironmentAccountPhoneDto,
  IUpdateEnvironmentAccountUsernameDto,
} from '../types/environment-account/dto.type';
import { IEnvironmentAccountService } from '../types/environment-account/service.type';
import {
  IEnvironmentAccount,
  environmentAccountSchema,
} from '../types/environment-account/environment-account.type';
import { IEnvironment } from '../types/environment/environment.type';
import { EnvironmentAccountRepository } from '../repositories/environment-account.repository';

@Injectable()
export class EnvironmentAccountService
  extends BaseService
  implements IEnvironmentAccountService
{
  constructor(
    private readonly environmentAccountRepository: EnvironmentAccountRepository
  ) {
    super('environment-account-service');
  }

  // @NOTE: maybe the transaction argument must be called something else here
  async create(
    environmentId: IEnvironment['id'],
    dto: ICreateEnvironmentAccountNoInternalPropertiesDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    this.logger.info(
      `create environment account in environment ${environmentId}`
    );
    try {
      const environmentAccountId =
        await this.environmentAccountRepository.create(
          {
            customProperties: {},
            ...dto,
            phoneVerified: false,
            emailVerified: false,
            environmentId,
          },
          transaction
        );

      this.logger.info(
        `new environment account created: ${environmentAccountId}`
      );

      return environmentAccountId;
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

  /**
   * Create account with password hash (for auth signup)
   */
  async createWithPassword(
    environmentId: IEnvironment['id'],
    dto: ICreateEnvironmentAccountNoInternalPropertiesDto & { passwordHash: string },
    transaction?: Knex.Transaction
  ): Promise<string> {
    this.logger.info(`create account with password for environment ${environmentId}`);

    const accountId = await this.environmentAccountRepository.create(
      {
        customProperties: {},
        ...dto,
        phoneVerified: false,
        emailVerified: false,
        environmentId,
      },
      transaction
    );

    this.logger.info(`new account with password created: ${accountId}`);

    return accountId;
  }

  /**
   * Get account by identifier (email, phone, or username) with password hash (for auth signin)
   */
  async getByIdentifierWithPassword(
    identifier: { email?: string; phone?: string; username?: string },
    environmentId: IEnvironmentAccount['environmentId']
  ): Promise<(IGetEnvironmentAccountDto & { passwordHash: string | null }) | undefined> {
    this.logger.info(`getByIdentifierWithPassword: ${JSON.stringify(identifier)}`);

    return await this.environmentAccountRepository.getByIdentifierWithPassword(
      identifier,
      environmentId
    );
  }

  async getById(
    id: IEnvironmentAccount['id']
  ): Promise<IGetEnvironmentAccountDto | undefined> {
    this.logger.info(`getById: ${id}`);

    return this.environmentAccountRepository.getById(id);
  }

  async getByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ): Promise<IGetEnvironmentAccountDto | undefined> {
    this.logger.info(`getById: ${id}`);

    return this.environmentAccountRepository.getByIdAndTenantEnvironmentId(
      id,
      environmentId
    );
  }

  async deleteById(id: IEnvironmentAccount['id']): Promise<boolean> {
    this.logger.info(`deleteById: ${id}`);

    const isIdValid = environmentAccountSchema
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

    return this.environmentAccountRepository.deleteById(id);
  }

  async deleteByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ): Promise<boolean> {
    this.logger.info(`deleteById: ${id}`);

    return this.environmentAccountRepository.deleteByIdAndTenantEnvironmentId(
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

    return this.environmentAccountRepository.updateByIdAndTenantEnvironmentId(
      id,
      environmentId,
      dto
    );
  }

  async updateEmailByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateEnvironmentAccountEmailDto
  ): Promise<boolean> {
    this.logger.info(`updateEmailById: ${id}`);

    return this.environmentAccountRepository.updateByIdAndTenantEnvironmentId(
      id,
      environmentId,
      dto
    );
  }

  async updateUsernameByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateEnvironmentAccountUsernameDto
  ): Promise<boolean> {
    this.logger.info(`updateUsernameById: ${id}`);

    return this.environmentAccountRepository.updateByIdAndTenantEnvironmentId(
      id,
      environmentId,
      dto
    );
  }

  async updatePhoneByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateEnvironmentAccountPhoneDto
  ): Promise<boolean> {
    this.logger.info(`updatePhoneById: ${id}`);

    return this.environmentAccountRepository.updateByIdAndTenantEnvironmentId(
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

    return this.environmentAccountRepository.setCustomPropertyByIdAndTenantEnvironmentId(
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

    return this.environmentAccountRepository.deleteCustomPropertyByIdAndTenantEnvironmentId(
      id,
      environmentId,
      customPropertyKey
    );
  }

  async disableByIdAndEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ): Promise<boolean> {
    this.logger.info(`disableById: ${id}`);

    return this.environmentAccountRepository.updateByIdAndTenantEnvironmentId(
      id,
      environmentId,
      {
        disabled: true,
        disabledAt: new Date(),
      }
    );
  }

  async enableByIdAndEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ): Promise<boolean> {
    this.logger.info(`enableById: ${id}`);

    return this.environmentAccountRepository.updateByIdAndTenantEnvironmentId(
      id,
      environmentId,
      {
        disabled: false,
        disabledAt: null,
      }
    );
  }

  /**
   * Update password hash for an account (for password reset)
   */
  async updatePasswordHashById(
    id: IEnvironmentAccount['id'],
    passwordHash: string
  ): Promise<boolean> {
    this.logger.info(`updatePasswordHashById: ${id}`);

    // Get the account to find its environmentId
    const account = await this.environmentAccountRepository.getById(id);
    if (!account) {
      return false;
    }

    return this.environmentAccountRepository.updateByIdAndTenantEnvironmentId(
      id,
      account.environmentId,
      { passwordHash }
    );
  }
}
