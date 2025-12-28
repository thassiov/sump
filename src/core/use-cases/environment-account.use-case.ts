import { Injectable } from '@nestjs/common';
import z from 'zod';
import { BaseUseCase } from '../../lib/base-classes';
import { contexts } from '../../lib/contexts';
import { ValidationError } from '../../lib/errors';
import { formatZodError } from '../../lib/utils/formatters';
import {
  CreateNewEnvironmentAccountUseCaseDtoResult,
  createEnvironmentAccountDtoSchema,
  ICreateEnvironmentAccountDto,
  IGetEnvironmentAccountDto,
  IUpdateTenantEnvironmentAccountEmailDto,
  IUpdateEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateTenantEnvironmentAccountPhoneDto,
  IUpdateTenantEnvironmentAccountUsernameDto,
  tenantEnvironmentAccountCustomPropertiesOperationDtoSchema,
  updateTenantEnvironmentAccountEmailDtoSchema,
  updateEnvironmentAccountNonSensitivePropertiesDtoSchema,
  updateTenantEnvironmentAccountPhoneDtoSchema,
  updateTenantEnvironmentAccountUsernameDtoSchema,
} from '../types/environment-account/dto.type';
import {
  IEnvironmentAccount,
  environmentAccountSchema,
} from '../types/environment-account/environment-account.type';
import { EnvironmentAccountUseCaseServices } from '../types/environment-account/use-case.type';
import { EnvironmentAccountService } from '../services/environment-account.service';

@Injectable()
class EnvironmentAccountUseCase extends BaseUseCase {
  protected services: EnvironmentAccountUseCaseServices;
  constructor(
    private readonly environmentAccountService: EnvironmentAccountService,
  ) {
    super('environment-account-use-case');
    this.services = {
      tenantEnvironmentAccount: this.environmentAccountService,
    };
  }

  async createNewAccount(
    environmentId: IEnvironmentAccount['environmentId'],
    dto: ICreateEnvironmentAccountDto
  ): Promise<CreateNewEnvironmentAccountUseCaseDtoResult> {
    this.validateTenantEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_CREATE
    );
    this.validateDto(
      dto,
      createEnvironmentAccountDtoSchema,
      contexts.ENVIRONMENT_ACCOUNT_CREATE
    );

    return this.services.tenantEnvironmentAccount.create(
      environmentId,
      dto
    );
  }

  async getAccountByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ): Promise<IGetEnvironmentAccountDto | undefined> {
    this.validateAccountId(id, contexts.ENVIRONMENT_ACCOUNT_CREATE);
    this.validateTenantEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_CREATE
    );

    return this.services.tenantEnvironmentAccount.getByIdAndTenantEnvironmentId(
      id,
      environmentId
    );
  }

  async deleteAccountByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ) {
    this.validateAccountId(id, contexts.ENVIRONMENT_ACCOUNT_CREATE);
    this.validateTenantEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_CREATE
    );

    return this.services.tenantEnvironmentAccount.deleteByIdAndTenantEnvironmentId(
      id,
      environmentId
    );
  }

  async updateAccountNonSensitivePropertiesByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateEnvironmentAccountNonSensitivePropertiesDto
  ) {
    this.validateAccountId(
      id,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateTenantEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      dto,
      updateEnvironmentAccountNonSensitivePropertiesDtoSchema,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.tenantEnvironmentAccount.updateNonSensitivePropertiesByIdAndTenantEnvironmentId(
      id,
      environmentId,
      dto
    );
  }

  async updateAccountEmailByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateTenantEnvironmentAccountEmailDto
  ) {
    this.validateAccountId(
      id,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateTenantEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      dto,
      updateTenantEnvironmentAccountEmailDtoSchema,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.tenantEnvironmentAccount.updateEmailByIdAndTenantEnvironmentId(
      id,
      environmentId,
      dto
    );
  }

  async updateAccountPhoneByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateTenantEnvironmentAccountPhoneDto
  ) {
    this.validateAccountId(
      id,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateTenantEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      dto,
      updateTenantEnvironmentAccountPhoneDtoSchema,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.tenantEnvironmentAccount.updatePhoneByIdAndTenantEnvironmentId(
      id,
      environmentId,
      dto
    );
  }

  async updateAccountUsernameByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateTenantEnvironmentAccountUsernameDto
  ) {
    this.validateAccountId(
      id,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateTenantEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      dto,
      updateTenantEnvironmentAccountUsernameDtoSchema,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.tenantEnvironmentAccount.updateUsernameByIdAndTenantEnvironmentId(
      id,
      environmentId,
      dto
    );
  }

  async setAccountCustomPropertyByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    customProperties: IEnvironmentAccount['customProperties']
  ) {
    this.validateAccountId(
      id,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateTenantEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      customProperties,
      tenantEnvironmentAccountCustomPropertiesOperationDtoSchema,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.tenantEnvironmentAccount.setCustomPropertyByIdAndTenantEnvironmentId(
      id,
      environmentId,
      customProperties
    );
  }

  async deleteAccountCustomPropertyByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    customPropertyKey: string
  ) {
    this.validateAccountId(
      id,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateTenantEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      customPropertyKey,
      z.string(),
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.tenantEnvironmentAccount.deleteCustomPropertyByIdAndTenantEnvironmentId(
      id,
      environmentId,
      customPropertyKey
    );
  }

  async disableAccountByIdAndEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ) {
    this.validateAccountId(id, contexts.ENVIRONMENT_ACCOUNT_DISABLE);
    this.validateTenantEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_DISABLE
    );

    return this.services.tenantEnvironmentAccount.disableByIdAndEnvironmentId(
      id,
      environmentId
    );
  }

  async enableAccountByIdAndEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ) {
    this.validateAccountId(id, contexts.ENVIRONMENT_ACCOUNT_ENABLE);
    this.validateTenantEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_ENABLE
    );

    return this.services.tenantEnvironmentAccount.enableByIdAndEnvironmentId(
      id,
      environmentId
    );
  }

  private validateAccountId(
    accountId: unknown,
    context: keyof typeof contexts
  ): void {
    const isIdValid = environmentAccountSchema
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
    environmentId: unknown,
    context: keyof typeof contexts
  ): void {
    const isTenantIdValid = environmentAccountSchema
      .pick({ environmentId: true })
      .safeParse({ environmentId });

    if (!isTenantIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { environmentId },
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

export { EnvironmentAccountUseCase };
