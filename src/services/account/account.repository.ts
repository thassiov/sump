import { Knex } from 'knex';
import { DatabaseError } from 'pg';
import { BaseRepository } from '../../base-classes';
import { IInsertReturningId } from '../../infra/database/postgres/types';
import { internalConfigs } from '../../lib/config';
import { contexts } from '../../lib/contexts';
import {
  ConflictError,
  NotExpectedError,
  NotFoundError,
  UnexpectedError,
} from '../../lib/errors';
import { BaseCustomError } from '../../lib/errors/base-custom-error.error';
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
        throw new NotExpectedError({
          context: contexts.ACCOUNT_CREATE,
          details: {
            input: { ...accountDto },
            output: result,
            message: 'database insert operation did not return an id',
          },
        });
      }

      return result.id;
    } catch (error) {
      console.log('ooooh come one');
      this.logger.error(error);
      if (error instanceof BaseCustomError) {
        throw error;
      }

      if (error instanceof DatabaseError) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (error.detail!.endsWith('already exists.')) {
          const conflictError = new ConflictError({
            cause: error as Error,
            context: contexts.ACCOUNT_CREATE,
            details: {
              input: { ...accountDto },
              message: 'User identification already in use',
            },
          });

          throw conflictError;
        }
      }

      console.log('is this working at least?');

      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.ACCOUNT_CREATE,
        details: {
          input: { ...accountDto },
        },
      });

      throw repositoryError;
    }
  }

  async getAccountById(accountId: string): Promise<IAccount | undefined> {
    try {
      return await this.sendFindByIdQuery(accountId);
    } catch (error) {
      const repositoryError = new UnexpectedError({
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
        throw new NotFoundError({
          context: contexts.ACCOUNT_UPDATE_BY_ID,
          details: {
            input: { accountId, ...updateAccountDto },
          },
        });
      }

      return true;
    } catch (error) {
      if (error instanceof BaseCustomError) {
        throw error;
      }

      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.ACCOUNT_UPDATE_BY_ID,
        details: {
          input: { accountId, ...updateAccountDto },
        },
      });

      throw repositoryError;
    }
  }

  async removeAccountById(accountId: string): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdQuery(accountId);

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.ACCOUNT_REMOVE_BY_ID,
          details: {
            input: { accountId },
          },
        });
      }

      return true;
    } catch (error) {
      if (error instanceof BaseCustomError) {
        throw error;
      }

      const repositoryError = new UnexpectedError({
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
