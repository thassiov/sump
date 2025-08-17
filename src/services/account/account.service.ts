import { Knex } from 'knex';
import { contexts } from '../../lib/contexts';
import { ServiceOperationError } from '../../lib/errors/service-operation.error';
import { logger } from '../../lib/logger';
import { IAccount } from '../../types/account.type';
import {
  createAccountDtoSchema,
  ICreateAccountDto,
  ICreateAccountOperationResult,
  IUpdateAccountDto,
} from './types/dto.type';
import { IAccountRepository } from './types/repository.type';
import { IAccountService } from './types/service.type';

export class AccountService implements IAccountService {
  constructor(private readonly accountRepository: IAccountRepository) {}

  // @NOTE: maybe the transaction argument must be called something else here
  async createAccount(
    newAccount: ICreateAccountDto,
    transaction?: Knex.Transaction
  ): Promise<ICreateAccountOperationResult> {
    // @TODO: move this validation to a api middleware. this service is suposed to receive the correct data
    const validationResult = createAccountDtoSchema.safeParse(newAccount);

    if (!validationResult.success) {
      const errorInstance = new ServiceOperationError({
        details: {
          input: newAccount,
          errors: validationResult.error.issues,
        },
        // @NOTE: add a new context, just for the account
        context: contexts.ACCOUNT_PROFILE_CREATE,
      });

      logger.info(errorInstance);
      throw errorInstance;
    }

    try {
      const accountId = await this.accountRepository.create(
        newAccount,
        transaction
      );

      return { accountId };
    } catch (error) {
      const errorInstance = new ServiceOperationError({
        details: {
          input: newAccount,
        },
        cause: error as Error,
        // @NOTE: add a new context, just for the account
        context: contexts.ACCOUNT_PROFILE_CREATE,
      });

      logger.error(errorInstance);

      throw errorInstance;
    }
  }

  async getAccountById(accountId: string): Promise<IAccount | undefined> {
    return this.accountRepository.getAccountById(accountId);
  }

  async removeAccountById(accountId: string): Promise<boolean> {
    return this.accountRepository.removeAccountById(accountId);
  }

  async updateAccountById(
    accountId: string,
    updateAccountDto: IUpdateAccountDto
  ): Promise<boolean> {
    return this.accountRepository.updateAccountById(
      accountId,
      updateAccountDto
    );
  }
}
