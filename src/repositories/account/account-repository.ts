import { Knex } from 'knex';
import { configs } from '../../lib/config';
import { contexts } from '../../lib/contexts';
import { RepositoryOperationError } from '../../lib/errors';
import { IAccount } from '../../types/account.type';
import { ICreateAccountDto, IUpdateAccountDto } from '../../types/dto.type';
import { IAccountRepository } from './types';

class AccountRepository implements IAccountRepository {
  private tableName: string;
  constructor(private readonly dbClient: Knex) {
    this.tableName = configs.repository.account.tableName;
  }

  async create(
    accountDto: ICreateAccountDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    try {
      const query = this.dbClient
        .insert({ ...accountDto })
        .into(this.tableName)
        .returning<{ id: string }[]>('id');

      if (transaction) {
        query.transacting(transaction);
      }

      const [result] = await query;

      if (!result) {
        throw new Error('could-not-create-account');
      }

      return result.id;
    } catch (error) {
      const repositoryError = new RepositoryOperationError({
        cause: error as Error,
        context: contexts.ACCOUNT_PROFILE_CREATE,
        details: {
          input: { accountDto },
        },
      });

      throw repositoryError;
    }
  }

  async getAccountById(accountId: string): Promise<IAccount | undefined> {
    try {
      return await this.dbClient<IAccount>(this.tableName)
        .where('id', accountId)
        .first();
    } catch (error) {
      const repositoryError = new RepositoryOperationError({
        cause: error as Error,
        context: contexts.GET_ACCOUNT_BY_ID,
        details: {
          input: { accountId },
        },
      });

      throw repositoryError;
    }
  }

  async updateAccountById(
    accountId: string,
    updateAccountDto: IUpdateAccountDto
  ): Promise<boolean> {
    try {
      const result = await this.dbClient<IUpdateAccountDto>(this.tableName)
        .where('id', accountId)
        .update(updateAccountDto);

      if (result === 0) {
        return false;
      }

      return true;
    } catch (error) {
      const repositoryError = new RepositoryOperationError({
        cause: error as Error,
        context: contexts.UPDATE_ACCOUNT_BY_ID,
        details: {
          input: { accountId },
        },
      });

      throw repositoryError;
    }
  }

  async removeAccountById(accountId: string): Promise<boolean> {
    try {
      const result = await this.dbClient<IAccount>(this.tableName)
        .where('id', accountId)
        .del();

      if (result === 0) {
        return false;
      }

      return true;
    } catch (error) {
      const repositoryError = new RepositoryOperationError({
        cause: error as Error,
        context: contexts.REMOVE_ACCOUNT_BY_ID,
        details: {
          input: { accountId },
        },
      });

      throw repositoryError;
    }
  }
}

export { AccountRepository };
