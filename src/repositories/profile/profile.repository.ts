import { Knex } from 'knex';
import { configs } from '../../lib/config';
import { contexts } from '../../lib/contexts';
import { RepositoryOperationError } from '../../lib/errors';
import { ICreateProfileDto } from '../../types/dto.type';
import { IProfileRepository } from './types';

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
      const query = this.dbClient
        .insert({ ...profileDto })
        .into(this.tableName)
        .returning<{ id: string }[]>('id');

      if (transaction) {
        query.transacting(transaction);
      }

      const [result] = await query;

      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      return result?.id as string;
    } catch (error) {
      const repositoryError = new RepositoryOperationError({
        cause: error as Error,
        context: contexts.ACCOUNT_PROFILE_CREATE,
        details: {
          input: { profileDto },
        },
      });

      throw repositoryError;
    }
  }
}

export { ProfileRepository };
