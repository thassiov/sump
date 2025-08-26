import { Knex } from 'knex';
import { BaseRepository } from '../../base-classes';
import { IInsertReturningId } from '../../infra/database/postgres/types';
import { internalConfigs } from '../../lib/config';
import { contexts } from '../../lib/contexts';
import {
  NotExpectedError,
  NotFoundError,
  UnexpectedError,
} from '../../lib/errors';
import { BaseCustomError } from '../../lib/errors/base-custom-error.error';
import {
  ICreateTenantEnvironmentDto,
  IUpdateTenantEnvironmentDto,
} from './types/dto.type';
import { ITenantEnvironmentRepository } from './types/repository.type';
import { ITenantEnvironment } from './types/tenant-environment.type';

class TenantEnvironmentRepository
  extends BaseRepository
  implements ITenantEnvironmentRepository
{
  private tableName: string;
  constructor(private readonly dbClient: Knex) {
    super('tenant-repository');
    this.tableName = internalConfigs.repository.tenant.tableName;
  }

  async create(
    dto: ICreateTenantEnvironmentDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    try {
      const [result] = await this.sendInsertReturningIdQuery(dto, transaction);

      if (!result) {
        throw new NotExpectedError({
          context: contexts.TENANT_ENVIRONMENT_CREATE,
          details: {
            input: { ...dto },
            output: result,
            message: 'database insert operation did not return an id',
          },
        });
      }

      return result.id;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof BaseCustomError) {
        throw error;
      }

      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.TENANT_ENVIRONMENT_CREATE,
        details: {
          input: { ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async getById(id: string): Promise<ITenantEnvironment | undefined> {
    try {
      return await this.sendFindByIdQuery(id);
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.TENANT_ENVIRONMENT_GET_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async updateById(
    id: string,
    dto: IUpdateTenantEnvironmentDto
  ): Promise<boolean> {
    try {
      const result = await this.sendUpdateByIdQuery(id, dto);

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.TENANT_ENVIRONMENT_UPDATE_BY_ID,
          details: {
            input: { id, ...dto },
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
        context: contexts.TENANT_ENVIRONMENT_UPDATE_BY_ID,
        details: {
          input: { id, ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdQuery(id);

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.TENANT_ENVIRONMENT_DELETE_BY_ID,
          details: {
            input: { id },
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
        context: contexts.TENANT_ENVIRONMENT_DELETE_BY_ID,
        details: {
          input: { id },
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
    id: string
  ): Promise<ITenantEnvironment | undefined> {
    return await this.dbClient<ITenantEnvironment>(this.tableName)
      .where('id', id)
      .first();
  }

  private async sendUpdateByIdQuery(
    id: string,
    dto: IUpdateTenantEnvironmentDto
  ): Promise<number> {
    return await this.dbClient(this.tableName).where('id', id).update(dto);
  }

  private async sendDeleteByIdQuery(id: string): Promise<number> {
    return await this.dbClient(this.tableName).where('id', id).del();
  }
}

export { TenantEnvironmentRepository };
