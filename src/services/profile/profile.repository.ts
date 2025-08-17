import { Knex } from 'knex';
import { IInsertReturningId } from '../../infra/database/postgres/types';
import { configs } from '../../lib/config';
import { contexts } from '../../lib/contexts';
import { RepositoryOperationError } from '../../lib/errors';
import { ICreateProfileDto, IUpdateProfileDto } from '../../types/dto.type';
import { IProfile } from '../../types/profile.type';
import { IProfileRepository } from './types/repository.type';

class ProfileRepository implements IProfileRepository {
  private tableName: string;
  constructor(private readonly dbClient: Knex) {
    this.tableName = configs.repository.profile.tableName;
  }

  async create(
    profileDto: ICreateProfileDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    try {
      const [result] = await this.sendInsertReturningIdQuery(
        profileDto,
        transaction
      );

      if (!result) {
        throw new Error('could-not-create-profile');
      }

      return result.id;
    } catch (error) {
      const repositoryError = new RepositoryOperationError({
        cause: error as Error,
        context: contexts.ACCOUNT_PROFILE_CREATE,
        details: {
          input: { payload: profileDto },
        },
      });

      throw repositoryError;
    }
  }

  async getProfileByAccountId(
    accountId: string
  ): Promise<IProfile | undefined> {
    try {
      return await this.sendFindByAccountIdQuery(accountId);
    } catch (error) {
      const repositoryError = new RepositoryOperationError({
        cause: error as Error,
        context: contexts.GET_PROFILE_BY_ACCOUNT_ID,
        details: {
          input: { accountId },
        },
      });

      throw repositoryError;
    }
  }

  async updateProfileByAccountId(
    accountId: string,
    updateProfileDto: IUpdateProfileDto
  ): Promise<boolean> {
    try {
      const result = await this.sendUpdateByAccountIdQuery(
        accountId,
        updateProfileDto
      );

      if (result === 0) {
        return false;
      }

      return true;
    } catch (error) {
      const repositoryError = new RepositoryOperationError({
        cause: error as Error,
        context: contexts.UPDATE_PROFILE_BY_ACCOUNT_ID,
        details: {
          input: { accountId, payload: updateProfileDto },
        },
      });

      throw repositoryError;
    }
  }

  private async sendFindByAccountIdQuery(
    accountId: string
  ): Promise<IProfile | undefined> {
    return await this.dbClient<IProfile>(this.tableName)
      .where('accountId', accountId)
      .first();
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

  private async sendUpdateByAccountIdQuery(
    accountId: string,
    updateProfileDto: IUpdateProfileDto
  ): Promise<number> {
    return await this.dbClient(this.tableName)
      .where('accountId', accountId)
      .update(updateProfileDto);
  }
}

export { ProfileRepository };
