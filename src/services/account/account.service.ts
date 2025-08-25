import { Knex } from 'knex';
import { BaseService } from '../../base-classes';
import { contexts } from '../../lib/contexts';
import { UnexpectedError, ValidationError } from '../../lib/errors';
import { BaseCustomError } from '../../lib/errors/base-custom-error.error';
import { IAccount } from './types/account.type';
import {
  createAccountDtoSchema,
  ICreateAccountDto,
  idSchema,
  IUpdateAccountDto,
  updateAccountDtoSchema,
} from './types/dto.type';
import { IAccountRepository } from './types/repository.type';
import { IAccountService } from './types/service.type';

export class AccountService extends BaseService implements IAccountService {
  constructor(private readonly accountRepository: IAccountRepository) {
    super('account-service');
  }

  // @NOTE: maybe the transaction argument must be called something else here
  async createAccount(
    newAccount: ICreateAccountDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    // @TODO: move this validation to a api middleware. this service is suposed to receive the correct data
    const validationResult = createAccountDtoSchema.safeParse(newAccount);

    if (!validationResult.success) {
      const errorInstance = new ValidationError({
        details: {
          input: newAccount,
          errors: validationResult.error.issues,
        },
        context: contexts.ACCOUNT_CREATE,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    try {
      const accountId = await this.accountRepository.create(
        newAccount,
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
          input: newAccount,
        },
        cause: error as Error,
        // @NOTE: add a new context, just for the account
        context: contexts.ACCOUNT_CREATE,
      });

      this.logger.error(errorInstance);

      throw errorInstance;
    }
  }

  async getAccountById(accountId: string): Promise<IAccount | undefined> {
    const isIdValid = idSchema.safeParse(accountId);

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { accountId },
          errors: isIdValid.error.issues,
        },
        context: contexts.ACCOUNT_GET_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.accountRepository.getAccountById(accountId);
  }

  async removeAccountById(accountId: string): Promise<boolean> {
    const isIdValid = idSchema.safeParse(accountId);

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { accountId },
          errors: isIdValid.error.issues,
        },
        context: contexts.ACCOUNT_REMOVE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.accountRepository.removeAccountById(accountId);
  }

  async updateAccountById(
    accountId: string,
    updateAccountDto: IUpdateAccountDto
  ): Promise<boolean> {
    const isIdValid = idSchema.safeParse(accountId);

    if (!isIdValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { accountId },
          errors: isIdValid.error.issues,
        },
        context: contexts.ACCOUNT_UPDATE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    const isPayloadValid = updateAccountDtoSchema.safeParse(updateAccountDto);

    if (!isPayloadValid.success) {
      const errorInstance = new ValidationError({
        details: {
          input: { accountId },
          errors: isPayloadValid.error.issues,
        },
        context: contexts.ACCOUNT_UPDATE_BY_ID,
      });

      this.logger.error(errorInstance);
      throw errorInstance;
    }

    return this.accountRepository.updateAccountById(
      accountId,
      updateAccountDto
    );
  }
}
