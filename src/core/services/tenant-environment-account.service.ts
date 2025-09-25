import { Knex } from 'knex';
import { BaseService } from '../../lib/base-classes';
import { contexts } from '../../lib/contexts';
import { UnexpectedError, ValidationError } from '../../lib/errors';
import { BaseCustomError } from '../../lib/errors/base-custom-error.error';
import { formatZodError } from '../../lib/utils/formatters';
import {
  createTenantEnvironmentAccountNoInternalPropertiesDtoSchema,
  ICreateTenantEnvironmentAccountNoInternalPropertiesDto,
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

    const isTenantEnvironmentIdValid = tenantEnvironmentAccountSchema
      .pick({ tenantEnvironmentId: true })
      .safeParse({ tenantEnvironmentId });

    if (!isTenantEnvironmentIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { tenantEnvironmentId },
          errors: formatZodError(isTenantEnvironmentIdValid.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const validationResult =
      createTenantEnvironmentAccountNoInternalPropertiesDtoSchema.safeParse(
        dto
      );

    if (!validationResult.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...dto },
          errors: formatZodError(validationResult.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

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

    const isIdValid = tenantEnvironmentAccountSchema
      .pick({ id: true })
      .safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_GET_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantEnvironmentAccountRepository.getById(id);
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

  async updateNonSensitivePropertiesById(
    id: ITenantEnvironmentAccount['id'],
    dto: IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto
  ): Promise<boolean> {
    this.logger.info(`updateNonSensitivePropertiesById: ${id}`);

    const isIdValid = tenantEnvironmentAccountSchema
      .pick({ id: true })
      .safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context:
          contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid =
      updateTenantEnvironmentAccountNonSensitivePropertiesDtoSchema.safeParse(
        dto
      );

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...dto },
          errors: formatZodError(isPayloadValid.error.issues),
        },
        context:
          contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantEnvironmentAccountRepository.updateById(id, dto);
  }

  async updateEmailById(
    id: ITenantEnvironmentAccount['id'],
    dto: IUpdateTenantEnvironmentAccountEmailDto
  ): Promise<boolean> {
    this.logger.info(`updateEmailById: ${id}`);
    const isIdValid = tenantEnvironmentAccountSchema
      .pick({ id: true })
      .safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_EMAIL_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid =
      updateTenantEnvironmentAccountEmailDtoSchema.safeParse(dto);

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...dto },
          errors: formatZodError(isPayloadValid.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_EMAIL_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantEnvironmentAccountRepository.updateById(id, dto);
  }

  async updateUsernameById(
    id: ITenantEnvironmentAccount['id'],
    dto: IUpdateTenantEnvironmentAccountUsernameDto
  ): Promise<boolean> {
    this.logger.info(`updateUsernameById: ${id}`);

    const isIdValid = tenantEnvironmentAccountSchema
      .pick({ id: true })
      .safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_USERNAME_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid =
      updateTenantEnvironmentAccountUsernameDtoSchema.safeParse(dto);

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...dto },
          errors: formatZodError(isPayloadValid.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_USERNAME_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantEnvironmentAccountRepository.updateById(id, dto);
  }

  async updatePhoneById(
    id: ITenantEnvironmentAccount['id'],
    dto: IUpdateTenantEnvironmentAccountPhoneDto
  ): Promise<boolean> {
    this.logger.info(`updatePhoneById: ${id}`);

    const isIdValid = tenantEnvironmentAccountSchema
      .pick({ id: true })
      .safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_PHONE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid =
      updateTenantEnvironmentAccountPhoneDtoSchema.safeParse(dto);

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...dto },
          errors: formatZodError(isPayloadValid.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_PHONE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantEnvironmentAccountRepository.updateById(id, dto);
  }

  async setCustomPropertyById(
    id: ITenantEnvironmentAccount['id'],
    customProperties: ITenantEnvironmentAccount['customProperties']
  ): Promise<boolean> {
    this.logger.info(`setCustomPropertyById: ${id}`);

    const isIdValid = tenantEnvironmentAccountSchema
      .pick({ id: true })
      .safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_SET_CUSTOM_PROPERTY_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid =
      tenantEnvironmentAccountCustomPropertiesOperationDtoSchema.safeParse({
        customProperties,
      });

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { ...customProperties },
          errors: formatZodError(isPayloadValid.error.issues),
        },
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_SET_CUSTOM_PROPERTY_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantEnvironmentAccountRepository.setCustomPropertyById(
      id,
      customProperties
    );
  }

  async deleteCustomPropertyById(
    id: ITenantEnvironmentAccount['id'],
    customPropertyKey: string
  ): Promise<boolean> {
    this.logger.info(`deleteCustomPropertyById: ${id}`);
    const isIdValid = tenantEnvironmentAccountSchema
      .pick({ id: true })
      .safeParse({ id });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { id },
          errors: formatZodError(isIdValid.error.issues),
        },
        context:
          contexts.TENANT_ENVIRONMENT_ACCOUNT_DELETE_CUSTOM_PROPERTY_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid =
      tenantEnvironmentAccountCustomPropertiesOperationDtoSchema.keyType.safeParse(
        customPropertyKey
      );

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { customPropertyKey },
          errors: formatZodError(isPayloadValid.error.issues),
        },
        context:
          contexts.TENANT_ENVIRONMENT_ACCOUNT_DELETE_CUSTOM_PROPERTY_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.tenantEnvironmentAccountRepository.deleteCustomPropertyById(
      id,
      customPropertyKey
    );
  }
}
