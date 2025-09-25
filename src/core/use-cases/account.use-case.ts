import { BaseUseCase } from '../../lib/base-classes';
import { contexts } from '../../lib/contexts';
import { NotFoundError, ValidationError } from '../../lib/errors';
import { formatZodError } from '../../lib/utils/formatters';
import { accountSchema, IAccount } from '../types/account/account.type';
import {
  CreateNewAccountUseCaseDtoResult,
  DeleteAccountByIdAndTenantIdUseCaseResultDto,
  ICreateAccountDto,
  UpdateAccountNonSensitivePropertiesByIdAndTenantIdUseCaseResultDto,
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
    const isIdValid = accountSchema
      .pick({ tenantId: true })
      .safeParse({ tenantId });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { tenantId },
          errors: formatZodError(isIdValid.error.issues),
        },
        context: contexts.ACCOUNT_CREATE,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

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
    const isIdValid = accountSchema
      .pick({ id: true })
      .safeParse({ id: accountId });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { accountId },
          errors: formatZodError(isIdValid.error.issues),
        },
        // @TODO: add a 'delete account by id and tenant id' context
        // context: contexts.deleteacc,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isTenantIdValid = accountSchema
      .pick({ tenantId: true })
      .safeParse({ tenantId });

    if (!isTenantIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { tenantId },
          errors: formatZodError(isTenantIdValid.error.issues),
        },
        // @TODO: add a 'delete account by id and tenant id' context
        // context: contexts.deleteacc,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }
    return this.services.account.deleteByIdAndTenantId(accountId, tenantId);
  }

  async updateNonSensitivePropertiesByIdAndTenantId(
    accountId: IAccount['id'],
    tenantId: IAccount['tenantId'],
    dto: IUpdateTenantNonSensitivePropertiesDto
  ): Promise<UpdateAccountNonSensitivePropertiesByIdAndTenantIdUseCaseResultDto> {
    const isIdValid = accountSchema
      .pick({ id: true })
      .safeParse({ id: accountId });

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { accountId },
          errors: formatZodError(isIdValid.error.issues),
        },
        // @TODO: add a 'delete account by id and tenant id' context
        // context: contexts.deleteacc,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isTenantIdValid = accountSchema
      .pick({ tenantId: true })
      .safeParse({ tenantId });

    if (!isTenantIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { tenantId },
          errors: formatZodError(isTenantIdValid.error.issues),
        },
        // @TODO: add a 'delete account by id and tenant id' context
        // context: contexts.deleteacc,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const tenant = await this.services.tenant.getById(tenantId);

    if (!tenant) {
      throw new NotFoundError({
        context: contexts.ACCOUNT_UPDATE_NON_SENSITIVE_PROPERTIES_BY_ID,
        details: {
          input: { tenantId },
        },
      });
    }

    return this.services.account.updateNonSensitivePropertiesById(
      accountId,
      dto,
      {
        tenantId: tenantId,
      }
    );
  }
}

export { AccountUseCase };
