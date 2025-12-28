import { Injectable } from '@nestjs/common';
import z from 'zod';
import { BaseUseCase } from '../../lib/base-classes';
import { contexts } from '../../lib/contexts';
import { ValidationError } from '../../lib/errors';
import { formatZodError } from '../../lib/utils/formatters';
import {
  CreateNewEnvironmentAccountUseCaseDtoResult,
  createEnvironmentAccountNoInternalPropertiesDtoSchema,
  ICreateEnvironmentAccountNoInternalPropertiesDto,
  IGetEnvironmentAccountDto,
  IUpdateEnvironmentAccountEmailDto,
  IUpdateEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateEnvironmentAccountPhoneDto,
  IUpdateEnvironmentAccountUsernameDto,
  environmentAccountCustomPropertiesOperationDtoSchema,
  updateEnvironmentAccountEmailDtoSchema,
  updateEnvironmentAccountNonSensitivePropertiesDtoSchema,
  updateEnvironmentAccountPhoneDtoSchema,
  updateEnvironmentAccountUsernameDtoSchema,
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
      environmentAccount: this.environmentAccountService,
    };
  }

  async createNewAccount(
    environmentId: IEnvironmentAccount['environmentId'],
    dto: ICreateEnvironmentAccountNoInternalPropertiesDto
  ): Promise<CreateNewEnvironmentAccountUseCaseDtoResult> {
    this.validateEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_CREATE
    );
    this.validateDto(
      dto,
      createEnvironmentAccountNoInternalPropertiesDtoSchema,
      contexts.ENVIRONMENT_ACCOUNT_CREATE
    );

    return this.services.environmentAccount.create(
      environmentId,
      dto
    );
  }

  async getAccountByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ): Promise<IGetEnvironmentAccountDto | undefined> {
    this.validateAccountId(id, contexts.ENVIRONMENT_ACCOUNT_CREATE);
    this.validateEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_CREATE
    );

    return this.services.environmentAccount.getByIdAndTenantEnvironmentId(
      id,
      environmentId
    );
  }

  async deleteAccountByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ) {
    this.validateAccountId(id, contexts.ENVIRONMENT_ACCOUNT_CREATE);
    this.validateEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_CREATE
    );

    return this.services.environmentAccount.deleteByIdAndTenantEnvironmentId(
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
    this.validateEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      dto,
      updateEnvironmentAccountNonSensitivePropertiesDtoSchema,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.environmentAccount.updateNonSensitivePropertiesByIdAndTenantEnvironmentId(
      id,
      environmentId,
      dto
    );
  }

  async updateAccountEmailByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateEnvironmentAccountEmailDto
  ) {
    this.validateAccountId(
      id,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      dto,
      updateEnvironmentAccountEmailDtoSchema,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.environmentAccount.updateEmailByIdAndTenantEnvironmentId(
      id,
      environmentId,
      dto
    );
  }

  async updateAccountPhoneByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateEnvironmentAccountPhoneDto
  ) {
    this.validateAccountId(
      id,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      dto,
      updateEnvironmentAccountPhoneDtoSchema,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.environmentAccount.updatePhoneByIdAndTenantEnvironmentId(
      id,
      environmentId,
      dto
    );
  }

  async updateAccountUsernameByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateEnvironmentAccountUsernameDto
  ) {
    this.validateAccountId(
      id,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      dto,
      updateEnvironmentAccountUsernameDtoSchema,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.environmentAccount.updateUsernameByIdAndTenantEnvironmentId(
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
    this.validateEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      customProperties,
      environmentAccountCustomPropertiesOperationDtoSchema,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.environmentAccount.setCustomPropertyByIdAndTenantEnvironmentId(
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
    this.validateEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );
    this.validateDto(
      customPropertyKey,
      z.string(),
      contexts.ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID
    );

    return this.services.environmentAccount.deleteCustomPropertyByIdAndTenantEnvironmentId(
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
    this.validateEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_DISABLE
    );

    return this.services.environmentAccount.disableByIdAndEnvironmentId(
      id,
      environmentId
    );
  }

  async enableAccountByIdAndEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ) {
    this.validateAccountId(id, contexts.ENVIRONMENT_ACCOUNT_ENABLE);
    this.validateEnvironmentId(
      environmentId,
      contexts.ENVIRONMENT_ACCOUNT_ENABLE
    );

    return this.services.environmentAccount.enableByIdAndEnvironmentId(
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

  private validateEnvironmentId(
    environmentId: unknown,
    context: keyof typeof contexts
  ): void {
    const isEnvironmentIdValid = environmentAccountSchema
      .pick({ environmentId: true })
      .safeParse({ environmentId });

    if (!isEnvironmentIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { environmentId },
          errors: formatZodError(isEnvironmentIdValid.error.issues),
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
