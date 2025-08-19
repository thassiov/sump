import { Knex } from 'knex';
import { BaseRepository } from '../../base-classes';
import { IInsertReturningId } from '../../infra/database/postgres/types';
import { internalConfigs } from '../../lib/config';
import { contexts } from '../../lib/contexts';
import { RepositoryOperationError } from '../../lib/errors';
import { IAccount } from './types/account.type';
import { ICreateAccountDto, IUpdateAccountDto } from './types/dto.type';
import { IAccountRepository } from './types/repository.type';

class AccountRepository extends BaseRepository implements IAccountRepository {
  private tableName: string;
  constructor(private readonly dbClient: Knex) {
    super('account-repository');
    this.tableName = internalConfigs.repository.account.tableName;
  }

  async create(
    accountDto: ICreateAccountDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    try {
      const [result] = await this.sendInsertReturningIdQuery(
        accountDto,
        transaction
      );

      if (!result) {
        throw new Error('could-not-create-account');
      }

      return result.id;
    } catch (error) {
      const repositoryError = new RepositoryOperationError({
        cause: error as Error,
        context: contexts.ACCOUNT_CREATE,
        details: {
          input: { payload: accountDto },
        },
      });

      throw repositoryError;
    }
  }

  async getAccountById(accountId: string): Promise<IAccount | undefined> {
    try {
      return await this.sendFindByIdQuery(accountId);
    } catch (error) {
      const repositoryError = new RepositoryOperationError({
        cause: error as Error,
        context: contexts.ACCOUNT_GET_BY_ID,
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
      const result = await this.sendUpdateByIdQuery(
        accountId,
        updateAccountDto
      );

      if (result === 0) {
        return false;
      }

      return true;
    } catch (error) {
      const repositoryError = new RepositoryOperationError({
        cause: error as Error,
        context: contexts.ACCOUNT_UPDATE_BY_ID,
        details: {
          input: { accountId, payload: updateAccountDto },
        },
      });

      throw repositoryError;
    }
  }

  async removeAccountById(accountId: string): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdQuery(accountId);

      if (result === 0) {
        return false;
      }

      return true;
    } catch (error) {
      const repositoryError = new RepositoryOperationError({
        cause: error as Error,
        context: contexts.ACCOUNT_REMOVE_BY_ID,
        details: {
          input: { accountId },
        },
      });

      throw repositoryError;
    }
  }

  private async sendInsertReturningIdQuery(
    payload: object,
    transaction?: Knex.Transaction
  ): Promise<IInsertReturningId> {
    const query = this.dbClient
      .insert(payload)
      .into(this.tableName)
      .returning<IInsertReturningId>('id');

    if (transaction) {
      query.transacting(transaction);
    }

    return await query;
  }

  private async sendFindByIdQuery(
    accountId: string
  ): Promise<IAccount | undefined> {
    return await this.dbClient<IAccount>(this.tableName)
      .where('id', accountId)
      .first();
  }

  private async sendUpdateByIdQuery(
    accountId: string,
    updateAccountDto: IUpdateAccountDto
  ): Promise<number> {
    return await this.dbClient(this.tableName)
      .where('id', accountId)
      .update(updateAccountDto);
  }

  private async sendDeleteByIdQuery(accountId: string): Promise<number> {
    return await this.dbClient(this.tableName).where('id', accountId).del();
  }
}

export { AccountRepository };
