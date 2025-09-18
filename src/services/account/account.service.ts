import { Knex } from 'knex';
import { BaseService } from '../../base-classes';
import { contexts } from '../../lib/contexts';
import { UnexpectedError, ValidationError } from '../../lib/errors';
import { BaseCustomError } from '../../lib/errors/base-custom-error.error';
import { formatZodError } from '../../lib/utils/formatters';
import { ITenant } from '../tenant/types/tenant.type';
import { accountSchema, IAccount } from './types/account.type';
import {
  accountUserDefinedIdentificationSchema,
  createAccountDtoSchema,
  createAccountNoInternalPropertiesDtoSchema,
  IAccountUserDefinedIdentification,
  ICreateAccountDto,
  IGetAccountDto,
  IUpdateAccountEmailDto,
  IUpdateAccountNonSensitivePropertiesDto,
  IUpdateAccountPhoneDto,
  IUpdateAccountUsernameDto,
  updateAccountEmailDtoSchema,
  updateAccountNonSensitivePropertiesDtoSchema,
  updateAccountPhoneDtoSchema,
  updateAccountUsernameDtoSchema,
} from './types/dto.type';
import { IAccountRepository } from './types/repository.type';
import { IAccountService } from './types/service.type';

export class AccountService extends BaseService implements IAccountService {
  constructor(private readonly accountRepository: IAccountRepository) {
    super('account-service');
  }

  // @NOTE: maybe the transaction argument must be called something else here
  async create(
    tenantId: ITenant['id'],
    dto: ICreateAccountDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    this.logger.info(`create account for tenant ${tenantId}`);

    const isTenantIdValid = createAccountDtoSchema
      .pick({ tenantId: true })
      .safeParse({ tenantId });

    if (!isTenantIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { tenantId },
          errors: formatZodError(isTenantIdValid.error.issues),
        },
        context: contexts.ACCOUNT_CREATE,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const validationResult =
      createAccountNoInternalPropertiesDtoSchema.safeParse(dto);

    if (!validationResult.success) {
      const errorInstance = new ValidationError({
        details: {
          input: dto,
          errors: formatZodError(validationResult.error.issues),
        },
        context: contexts.ACCOUNT_CREATE,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    try {
      const accountId = await this.accountRepository.create(
        { ...dto, tenantId },
        transaction
      );

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
        context: contexts.ACCOUNT_CREATE,
      });

      this.logger.error(errorInstance);

      throw errorInstance;
    }
  }

  async getById(id: IAccount['id']): Promise<IGetAccountDto | undefined> {
    this.logger.info(`getById: ${id}`);
    const isIdValid = accountSchema.pick({ id: true }).safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.ACCOUNT_GET_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.accountRepository.getById(id);
  }

  async getByTenantId(
    tenantId: IAccount['tenantId']
  ): Promise<IGetAccountDto[] | undefined> {
    this.logger.info(`getByTenantId: ${tenantId}`);
    const isIdValid = accountSchema
      .pick({ tenantId: true })
      .safeParse({ tenantId });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { tenantId },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.ACCOUNT_GET_BY_TENANT_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.accountRepository.getByTenantId(tenantId);
  }

  async getByAccountIdAndTenantId(
    accountId: IAccount['id'],
    tenantId: IAccount['tenantId']
  ): Promise<IGetAccountDto | undefined> {
    this.logger.info(`getByAccountIdAndTenantId: ${accountId} ${tenantId}`);

    const isTenantIdValid = accountSchema
      .pick({ tenantId: true })
      .safeParse({ tenantId });

    if (!isTenantIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { tenantId },
          errors: formatZodError(isTenantIdValid.error.issues),
        },
        context: contexts.ACCOUNT_GET_BY_ACCOUNT_ID_AND_TENANT_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isAccountIdValid = accountSchema
      .pick({ id: true })
      .safeParse({ id: accountId });

    if (!isAccountIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { accountId },
          errors: formatZodError(isAccountIdValid.error.issues),
        },
        context: contexts.ACCOUNT_GET_BY_ACCOUNT_ID_AND_TENANT_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.accountRepository.getByAccountIdAndTenantId(
      accountId,
      tenantId
    );
  }

  async getByUserDefinedIdentification(
    accountUserDefinedIdentification: IAccountUserDefinedIdentification
  ): Promise<IGetAccountDto[] | undefined> {
    this.logger.info(
      `getByUserDefinedIdentification: ${JSON.stringify(accountUserDefinedIdentification)}`
    );

    const isUDIValid = accountUserDefinedIdentificationSchema.safeParse(
      accountUserDefinedIdentification
    );

    if (!isUDIValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...accountUserDefinedIdentification },
          errors: formatZodError(isUDIValid.error.issues),
        },
        context: contexts.ACCOUNT_GET_BY_USER_DEFINED_IDENTIFICATION,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return await this.accountRepository.getByUserDefinedIdentification(
      accountUserDefinedIdentification
    );
  }

  async deleteById(id: IAccount['id']): Promise<boolean> {
    this.logger.info(`deleteById: ${id}`);
    const isIdValid = accountSchema.pick({ id: true }).safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.ACCOUNT_DELETE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.accountRepository.deleteById(id);
  }

  /**
   * this method must be used for *non sensitive properties* only
   * the other properties must have their own methods, with their own specific validations
   * */
  async updateNonSensitivePropertiesById(
    id: IAccount['id'],
    dto: IUpdateAccountNonSensitivePropertiesDto
  ): Promise<boolean> {
    this.logger.info(`updateNonSensitivePropertiesById: ${id}`);

    const isIdValid = accountSchema.pick({ id: true }).safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid =
      updateAccountNonSensitivePropertiesDtoSchema.safeParse(dto);

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...dto },
          errors: formatZodError(isPayloadValid.error.issues),
        },
        context: contexts.ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.accountRepository.updateById(id, dto);
  }

  async updateEmailById(
    id: IAccount['id'],
    dto: IUpdateAccountEmailDto
  ): Promise<boolean> {
    this.logger.info(`updateEmailById: ${id}`);
    const isIdValid = accountSchema.pick({ id: true }).safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.ACCOUNT_UPDATE_EMAIL_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid = updateAccountEmailDtoSchema.safeParse(dto);

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...dto },
          errors: formatZodError(isPayloadValid.error.issues),
        },
        context: contexts.ACCOUNT_UPDATE_EMAIL_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.accountRepository.updateById(id, dto);
  }

  async updateUsernameById(
    id: IAccount['id'],
    dto: IUpdateAccountUsernameDto
  ): Promise<boolean> {
    this.logger.info(`updateUsernameById: ${id}`);

    const isIdValid = accountSchema.pick({ id: true }).safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.ACCOUNT_UPDATE_USERNAME_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid = updateAccountUsernameDtoSchema.safeParse(dto);

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...dto },
          errors: formatZodError(isPayloadValid.error.issues),
        },
        context: contexts.ACCOUNT_UPDATE_USERNAME_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.accountRepository.updateById(id, dto);
  }

  async updatePhoneById(
    id: IAccount['id'],
    dto: IUpdateAccountPhoneDto
  ): Promise<boolean> {
    this.logger.info(`updatePhoneById: ${id}`);

    const isIdValid = accountSchema.pick({ id: true }).safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.ACCOUNT_UPDATE_PHONE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid = updateAccountPhoneDtoSchema.safeParse(dto);

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...dto },
          errors: formatZodError(isPayloadValid.error.issues),
        },
        context: contexts.ACCOUNT_UPDATE_PHONE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.accountRepository.updateById(id, dto);
  }
}
