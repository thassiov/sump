import z from 'zod';
import { BaseUseCase } from '../../lib/base-classes';
import { contexts } from '../../lib/contexts';
import { ValidationError } from '../../lib/errors';
import { formatZodError } from '../../lib/utils/formatters';
import {
  CreateNewTenantEnvironmentAccountUseCaseDtoResult,
  createTenantEnvironmentAccountDtoSchema,
  ICreateTenantEnvironmentAccountDto,
  IGetTenantEnvironmentAccountDto,
  IUpdateTenantEnvironmentAccountEmailDto,
  IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateTenantEnvironmentAccountPhoneDto,
  IUpdateTenantEnvironmentAccountUsernameDto,
  tenantEnvironmentAccountCustomPropertiesOperationDtoSchema,
  updateTenantEnvironmentAccountEmailDtoSchema,
  updateTenantEnvironmentAccountNonSensitivePropertiesDtoSchema,
  updateTenantEnvironmentAccountPhoneDtoSchema,
  updateTenantEnvironmentAccountUsernameDtoSchema,
} from '../types/tenant-environment-account/dto.type';
import {
  ITenantEnvironmentAccount,
  tenantEnvironmentAccountSchema,
} from '../types/tenant-environment-account/tenant-environment-account.type';
import { TenantEnvironmentAccountUseCaseServices } from '../types/tenant-environment-account/use-case.type';

class TenantEnvironmentAccountUseCase extends BaseUseCase {
  protected services: TenantEnvironmentAccountUseCaseServices;
  constructor(services: TenantEnvironmentAccountUseCaseServices) {
    super('tenant-environment-account-use-case');
    this.services = services;
  }

  async createNewAccount(
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: ICreateTenantEnvironmentAccountDto
  ): Promise<CreateNewTenantEnvironmentAccountUseCaseDtoResult> {
    this.validateTenantEnvironmentId(
      tenantEnvironmentId,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE
    );
    this.validateDto(
      dto,
      createTenantEnvironmentAccountDtoSchema,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE
    );

    return this.services.tenantEnvironmentAccount.create(
      tenantEnvironmentId,
      dto
    );
  }

  async getAccountByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId']
  ): Promise<IGetTenantEnvironmentAccountDto | undefined> {
    this.validateAccountId(id, contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE);
    this.validateTenantEnvironmentId(
      tenantEnvironmentId,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE
    );

    return this.services.tenantEnvironmentAccount.getByIdAndTenantEnvironmentId(
      id,
      tenantEnvironmentId
    );
  }

  async deleteAccountByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId']
  ) {
    this.validateAccountId(id, contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE);
    this.validateTenantEnvironmentId(
      tenantEnvironmentId,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE
    );

    return this.services.tenantEnvironmentAccount.deleteByIdAndTenantEnvironmentId(
      id,
      tenantEnvironmentId
    );
  }

  async updateAccountNonSensitivePropertiesByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto
  ) {
    this.validateAccountId(
      id,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateTenantEnvironmentId(
      tenantEnvironmentId,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      dto,
      updateTenantEnvironmentAccountNonSensitivePropertiesDtoSchema,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.tenantEnvironmentAccount.updateNonSensitivePropertiesByIdAndTenantEnvironmentId(
      id,
      tenantEnvironmentId,
      dto
    );
  }

  async updateAccountEmailByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: IUpdateTenantEnvironmentAccountEmailDto
  ) {
    this.validateAccountId(
      id,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateTenantEnvironmentId(
      tenantEnvironmentId,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      dto,
      updateTenantEnvironmentAccountEmailDtoSchema,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.tenantEnvironmentAccount.updateEmailByIdAndTenantEnvironmentId(
      id,
      tenantEnvironmentId,
      dto
    );
  }

  async updateAccountPhoneByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: IUpdateTenantEnvironmentAccountPhoneDto
  ) {
    this.validateAccountId(
      id,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateTenantEnvironmentId(
      tenantEnvironmentId,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      dto,
      updateTenantEnvironmentAccountPhoneDtoSchema,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.tenantEnvironmentAccount.updatePhoneByIdAndTenantEnvironmentId(
      id,
      tenantEnvironmentId,
      dto
    );
  }

  async updateAccountUsernameByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: IUpdateTenantEnvironmentAccountUsernameDto
  ) {
    this.validateAccountId(
      id,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateTenantEnvironmentId(
      tenantEnvironmentId,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      dto,
      updateTenantEnvironmentAccountUsernameDtoSchema,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.tenantEnvironmentAccount.updateUsernameByIdAndTenantEnvironmentId(
      id,
      tenantEnvironmentId,
      dto
    );
  }

  async setAccountCustomPropertyByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    customProperties: ITenantEnvironmentAccount['customProperties']
  ) {
    this.validateAccountId(
      id,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateTenantEnvironmentId(
      tenantEnvironmentId,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      customProperties,
      tenantEnvironmentAccountCustomPropertiesOperationDtoSchema,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.tenantEnvironmentAccount.setCustomPropertyByIdAndTenantEnvironmentId(
      id,
      tenantEnvironmentId,
      customProperties
    );
  }

  async deleteAccountCustomPropertyByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    customPropertyKey: string
  ) {
    this.validateAccountId(
      id,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateTenantEnvironmentId(
      tenantEnvironmentId,
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      customPropertyKey,
      z.string(),
      contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.tenantEnvironmentAccount.deleteCustomPropertyByIdAndTenantEnvironmentId(
      id,
      tenantEnvironmentId,
      customPropertyKey
    );
  }

  private validateAccountId(
    accountId: unknown,
    context: keyof typeof contexts
  ): void {
    const isIdValid = tenantEnvironmentAccountSchema
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

  private validateTenantEnvironmentId(
    tenantEnvironmentId: unknown,
    context: keyof typeof contexts
  ): void {
    const isTenantIdValid = tenantEnvironmentAccountSchema
      .pick({ tenantEnvironmentId: true })
      .safeParse({ tenantEnvironmentId });

    if (!isTenantIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { tenantEnvironmentId },
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

export { TenantEnvironmentAccountUseCase };
