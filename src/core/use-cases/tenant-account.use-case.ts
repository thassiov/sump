import { Injectable } from '@nestjs/common';
import z from 'zod';
import { BaseUseCase } from '../../lib/base-classes';
import { contexts } from '../../lib/contexts';
import { NotFoundError, ValidationError } from '../../lib/errors';
import { formatZodError } from '../../lib/utils/formatters';
import { tenantAccountSchema, ITenantAccount } from '../types/tenant-account/tenant-account.type';
import {
  createTenantAccountDtoSchema,
  CreateNewTenantAccountUseCaseDtoResult,
  DeleteTenantAccountByIdAndTenantIdUseCaseResultDto,
  ITenantAccountUserDefinedIdentification,
  ICreateTenantAccountDto,
  IGetTenantAccountDto,
  IUpdateTenantAccountEmailDto,
  IUpdateTenantAccountPhoneDto,
  IUpdateTenantAccountUsernameDto,
  UpdateTenantAccountEmailByIdAndTenantIdUseCaseResultDto,
  UpdateTenantAccountNonSensitivePropertiesByIdAndTenantIdUseCaseResultDto,
  updateTenantAccountNonSensitivePropertiesDtoSchema,
  UpdateTenantAccountPhoneByIdAndTenantIdUseCaseResultDto,
  UpdateTenantAccountUsernameByIdAndTenantIdUseCaseResultDto,
  updateTenantAccountEmailDtoSchema,
  updateTenantAccountPhoneDtoSchema,
  updateTenantAccountUsernameDtoSchema,
  tenantAccountUserDefinedIdentificationSchema,
} from '../types/tenant-account/dto.type';
import { TenantAccountUseCaseServices } from '../types/tenant-account/use-case.type';
import { IUpdateTenantNonSensitivePropertiesDto } from '../types/tenant/dto.type';
import { TenantService } from '../services/tenant.service';
import { TenantAccountService } from '../services/tenant-account.service';

@Injectable()
class TenantAccountUseCase extends BaseUseCase {
  protected services: TenantAccountUseCaseServices;
  constructor(
    private readonly tenantService: TenantService,
    private readonly tenantAccountService: TenantAccountService,
  ) {
    super('tenant-account-use-case');
    this.services = {
      tenant: this.tenantService,
      tenantAccount: this.tenantAccountService,
    };
  }

  async createNewAccount(
    tenantId: ITenantAccount['tenantId'],
    dto: ICreateTenantAccountDto
  ): Promise<CreateNewTenantAccountUseCaseDtoResult> {
    this.validateTenantId(tenantId, contexts.TENANT_ACCOUNT_CREATE);
    this.validateDto(dto, createTenantAccountDtoSchema, contexts.TENANT_ACCOUNT_CREATE);

    const tenant = await this.services.tenant.getById(tenantId);

    if (!tenant) {
      throw new NotFoundError({
        context: contexts.TENANT_ACCOUNT_CREATE,
        details: {
          input: { tenantId },
        },
      });
    }

    // @TODO: add a `canCreateAccount` for cheking for a previously registered token, email, phone
    //  this must be paired with a `inviteAccount` functionality as well to send an invitation

    return this.services.tenantAccount.create(tenantId, dto);
  }

  async deleteAccountByIdAndTenantId(
    accountId: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId']
  ): Promise<DeleteTenantAccountByIdAndTenantIdUseCaseResultDto> {
    this.validateAccountId(accountId, contexts.TENANT_ACCOUNT_DELETE_BY_ID);
    this.validateTenantId(tenantId, contexts.TENANT_ACCOUNT_DELETE_BY_ID);

    const canBeDeleted = await this.services.tenantAccount.canAccountBeDeleted(
      accountId,
      tenantId
    );

    if (!canBeDeleted) {
      throw new ValidationError();
    }

    return this.services.tenantAccount.deleteByIdAndTenantId(accountId, tenantId);
  }

  async updateNonSensitivePropertiesByIdAndTenantId(
    accountId: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId'],
    dto: IUpdateTenantNonSensitivePropertiesDto
  ): Promise<UpdateTenantAccountNonSensitivePropertiesByIdAndTenantIdUseCaseResultDto> {
    this.validateAccountId(
      accountId,
      contexts.TENANT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateTenantId(
      tenantId,
      contexts.TENANT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      dto,
      updateTenantAccountNonSensitivePropertiesDtoSchema,
      contexts.TENANT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    const tenant = await this.services.tenant.getById(tenantId);

    if (!tenant) {
      throw new NotFoundError({
        context: contexts.TENANT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID,
        details: {
          input: { tenantId },
        },
      });
    }

    return this.services.tenantAccount.updateNonSensitivePropertiesByIdAndTenantId(
      accountId,
      tenantId,
      dto
    );
  }

  async getAccountByIdAndTenantId(
    accountId: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId']
  ): Promise<IGetTenantAccountDto | undefined> {
    this.validateAccountId(
      accountId,
      contexts.TENANT_ACCOUNT_GET_BY_ACCOUNT_ID_AND_TENANT_ID
    );
    this.validateTenantId(
      tenantId,
      contexts.TENANT_ACCOUNT_GET_BY_ACCOUNT_ID_AND_TENANT_ID
    );

    return this.services.tenantAccount.getByAccountIdAndTenantId(accountId, tenantId);
  }

  async getAccountByUserDefinedIdentificationAndTenantId(
    accountUserDefinedIdentification: ITenantAccountUserDefinedIdentification,
    tenantId: ITenantAccount['tenantId']
  ): Promise<IGetTenantAccountDto[] | undefined> {
    this.validateDto(
      accountUserDefinedIdentification,
      tenantAccountUserDefinedIdentificationSchema,
      contexts.TENANT_ACCOUNT_GET_BY_USER_DEFINED_IDENTIFICATION
    );

    this.validateTenantId(
      tenantId,
      contexts.TENANT_ACCOUNT_GET_BY_USER_DEFINED_IDENTIFICATION
    );

    return this.services.tenantAccount.getByUserDefinedIdentificationAndTenantId(
      accountUserDefinedIdentification,
      tenantId
    );
  }

  async updateAccountEmailByIdAndTenantId(
    accountId: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId'],
    dto: IUpdateTenantAccountEmailDto
  ): Promise<UpdateTenantAccountEmailByIdAndTenantIdUseCaseResultDto> {
    this.validateAccountId(accountId, contexts.TENANT_ACCOUNT_UPDATE_EMAIL_BY_ID);
    this.validateTenantId(tenantId, contexts.TENANT_ACCOUNT_UPDATE_EMAIL_BY_ID);
    this.validateDto(
      dto,
      updateTenantAccountEmailDtoSchema,
      contexts.TENANT_ACCOUNT_UPDATE_EMAIL_BY_ID
    );

    return this.services.tenantAccount.updateEmailByIdAndTenantId(
      accountId,
      tenantId,
      dto
    );
  }

  async updateAccountPhoneByIdAndTenantId(
    accountId: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId'],
    dto: IUpdateTenantAccountPhoneDto
  ): Promise<UpdateTenantAccountPhoneByIdAndTenantIdUseCaseResultDto> {
    this.validateAccountId(accountId, contexts.TENANT_ACCOUNT_UPDATE_PHONE_BY_ID);
    this.validateTenantId(tenantId, contexts.TENANT_ACCOUNT_UPDATE_PHONE_BY_ID);
    this.validateDto(
      dto,
      updateTenantAccountPhoneDtoSchema,
      contexts.TENANT_ACCOUNT_UPDATE_PHONE_BY_ID
    );

    return this.services.tenantAccount.updatePhoneByIdAndTenantId(
      accountId,
      tenantId,
      dto
    );
  }

  async updateAccountUsernameByIdAndTenantId(
    accountId: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId'],
    dto: IUpdateTenantAccountUsernameDto
  ): Promise<UpdateTenantAccountUsernameByIdAndTenantIdUseCaseResultDto> {
    this.validateAccountId(accountId, contexts.TENANT_ACCOUNT_UPDATE_USERNAME_BY_ID);
    this.validateTenantId(tenantId, contexts.TENANT_ACCOUNT_UPDATE_USERNAME_BY_ID);
    this.validateDto(
      dto,
      updateTenantAccountUsernameDtoSchema,
      contexts.TENANT_ACCOUNT_UPDATE_USERNAME_BY_ID
    );

    return this.services.tenantAccount.updateUsernameByIdAndTenantId(
      accountId,
      tenantId,
      dto
    );
  }

  private validateAccountId(
    accountId: unknown,
    context: keyof typeof contexts
  ): void {
    const isIdValid = tenantAccountSchema
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
    const isTenantIdValid = tenantAccountSchema
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

export { TenantAccountUseCase };
