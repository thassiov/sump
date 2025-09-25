import z from 'zod';
import { BaseUseCase } from '../../lib/base-classes';
import { contexts } from '../../lib/contexts';
import { NotFoundError, ValidationError } from '../../lib/errors';
import { formatZodError } from '../../lib/utils/formatters';
import { accountSchema, IAccount } from '../types/account/account.type';
import {
  createAccountDtoSchema,
  CreateNewAccountUseCaseDtoResult,
  DeleteAccountByIdAndTenantIdUseCaseResultDto,
  IAccountUserDefinedIdentification,
  ICreateAccountDto,
  IGetAccountDto,
  IUpdateAccountEmailDto,
  IUpdateAccountPhoneDto,
  IUpdateAccountUsernameDto,
  UpdateAccountEmailByIdAndTenantIdUseCaseResultDto,
  UpdateAccountNonSensitivePropertiesByIdAndTenantIdUseCaseResultDto,
  updateAccountNonSensitivePropertiesDtoSchema,
  UpdateAccountPhoneByIdAndTenantIdUseCaseResultDto,
  UpdateAccountUsernameByIdAndTenantIdUseCaseResultDto,
  updateAccountUsernameDtoSchema,
} from '../types/account/dto.type';
import { AccountUseCaseServices } from '../types/account/use-case.type';
import { IUpdateTenantNonSensitivePropertiesDto } from '../types/tenant/dto.type';

class AccountUseCase extends BaseUseCase {
  protected services: AccountUseCaseServices;
  constructor(services: AccountUseCaseServices) {
    super('account-use-case');
    this.services = services;
  }

  async createNewAccount(
    tenantId: IAccount['tenantId'],
    dto: ICreateAccountDto
  ): Promise<CreateNewAccountUseCaseDtoResult> {
    this.validateTenantId(tenantId, contexts.ACCOUNT_CREATE);
    this.validateDto(dto, createAccountDtoSchema, contexts.ACCOUNT_CREATE);

    const tenant = await this.services.tenant.getById(tenantId);

    if (!tenant) {
      throw new NotFoundError({
        context: contexts.ACCOUNT_CREATE,
        details: {
          input: { tenantId },
        },
      });
    }

    // @TODO: add a `canCreateAccount` for cheking for a previously registered token, email, phone
    //  this must be paired with a `inviteAccount` functionality as well to send an invitation

    return this.services.account.create(tenantId, dto);
  }

  async deleteAccountByIdAndTenantId(
    accountId: IAccount['id'],
    tenantId: IAccount['tenantId']
  ): Promise<DeleteAccountByIdAndTenantIdUseCaseResultDto> {
    this.validateAccountId(accountId, contexts.ACCOUNT_DELETE_BY_ID);
    this.validateTenantId(tenantId, contexts.ACCOUNT_DELETE_BY_ID);

    const canBeDeleted = await this.services.account.canAccountBeDeleted(
      accountId,
      tenantId
    );

    if (!canBeDeleted) {
      throw new ValidationError();
    }

    return this.services.account.deleteByIdAndTenantId(accountId, tenantId);
  }

  async updateNonSensitivePropertiesByIdAndTenantId(
    accountId: IAccount['id'],
    tenantId: IAccount['tenantId'],
    dto: IUpdateTenantNonSensitivePropertiesDto
  ): Promise<UpdateAccountNonSensitivePropertiesByIdAndTenantIdUseCaseResultDto> {
    this.validateAccountId(
      accountId,
      contexts.ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateTenantId(
      tenantId,
      contexts.ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      dto,
      updateAccountNonSensitivePropertiesDtoSchema,
      contexts.ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    const tenant = await this.services.tenant.getById(tenantId);

    if (!tenant) {
      throw new NotFoundError({
        context: contexts.ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID,
        details: {
          input: { tenantId },
        },
      });
    }

    return this.services.account.updateNonSensitivePropertiesByIdAndTenantId(
      accountId,
      tenantId,
      dto
    );
  }

  async getAccountByIdAndTenantId(
    accountId: IAccount['id'],
    tenantId: IAccount['tenantId']
  ): Promise<IGetAccountDto | undefined> {
    this.validateAccountId(
      accountId,
      contexts.ACCOUNT_GET_BY_ACCOUNT_ID_AND_TENANT_ID
    );
    this.validateTenantId(
      tenantId,
      contexts.ACCOUNT_GET_BY_ACCOUNT_ID_AND_TENANT_ID
    );

    return this.services.account.getByAccountIdAndTenantId(accountId, tenantId);
  }

  async getAccountByUserDefinedIdentificationAndTenantId(
    accountUserDefinedIdentification: IAccountUserDefinedIdentification,
    tenantId: IAccount['tenantId']
  ): Promise<IGetAccountDto[] | undefined> {
    this.validateDto(
      accountUserDefinedIdentification,
      updateAccountUsernameDtoSchema,
      contexts.ACCOUNT_GET_BY_USER_DEFINED_IDENTIFICATION
    );

    this.validateTenantId(
      tenantId,
      contexts.ACCOUNT_GET_BY_USER_DEFINED_IDENTIFICATION
    );

    return this.services.account.getByUserDefinedIdentificationAndTenantId(
      accountUserDefinedIdentification,
      tenantId
    );
  }

  async updateAccountEmailByIdAndTenantId(
    accountId: IAccount['id'],
    tenantId: IAccount['tenantId'],
    dto: IUpdateAccountEmailDto
  ): Promise<UpdateAccountEmailByIdAndTenantIdUseCaseResultDto> {
    this.validateAccountId(accountId, contexts.ACCOUNT_UPDATE_EMAIL_BY_ID);
    this.validateTenantId(tenantId, contexts.ACCOUNT_UPDATE_EMAIL_BY_ID);
    this.validateDto(
      dto,
      updateAccountUsernameDtoSchema,
      contexts.ACCOUNT_UPDATE_EMAIL_BY_ID
    );

    return this.services.account.updateEmailByIdAndTenantId(
      accountId,
      tenantId,
      dto
    );
  }

  async updateAccountPhoneByIdAndTenantId(
    accountId: IAccount['id'],
    tenantId: IAccount['tenantId'],
    dto: IUpdateAccountPhoneDto
  ): Promise<UpdateAccountPhoneByIdAndTenantIdUseCaseResultDto> {
    this.validateAccountId(accountId, contexts.ACCOUNT_UPDATE_PHONE_BY_ID);
    this.validateTenantId(tenantId, contexts.ACCOUNT_UPDATE_PHONE_BY_ID);
    this.validateDto(
      dto,
      updateAccountUsernameDtoSchema,
      contexts.ACCOUNT_UPDATE_PHONE_BY_ID
    );

    return this.services.account.updatePhoneByIdAndTenantId(
      accountId,
      tenantId,
      dto
    );
  }

  async updateAccountUsernameByIdAndTenantId(
    accountId: IAccount['id'],
    tenantId: IAccount['tenantId'],
    dto: IUpdateAccountUsernameDto
  ): Promise<UpdateAccountUsernameByIdAndTenantIdUseCaseResultDto> {
    this.validateAccountId(accountId, contexts.ACCOUNT_UPDATE_USERNAME_BY_ID);
    this.validateTenantId(tenantId, contexts.ACCOUNT_UPDATE_USERNAME_BY_ID);
    this.validateDto(
      dto,
      updateAccountUsernameDtoSchema,
      contexts.ACCOUNT_UPDATE_USERNAME_BY_ID
    );

    return this.services.account.updateUsernameByIdAndTenantId(
      accountId,
      tenantId,
      dto
    );
  }

  private validateAccountId(
    accountId: unknown,
    context: keyof typeof contexts
  ): void {
    const isIdValid = accountSchema
      .pick({ id: true })
      .safeParse({ id: accountId });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { accountId },
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
    const isTenantIdValid = accountSchema
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

export { AccountUseCase };
