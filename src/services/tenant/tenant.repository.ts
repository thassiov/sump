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
import { ICreateTenantDto, IUpdateTenantDto } from './types/dto.type';
import { ITenantRepository } from './types/repository.type';
import { ITenant } from './types/tenant.type';

class TenantRepository extends BaseRepository implements ITenantRepository {
  private tableName: string;
  constructor(private readonly dbClient: Knex) {
    super('tenant-repository');
    this.tableName = internalConfigs.repository.tenant.tableName;
  }

  async create(
    tenantDto: ICreateTenantDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    try {
      const [result] = await this.sendInsertReturningIdQuery(
        tenantDto,
        transaction
      );

      if (!result) {
        throw new NotExpectedError({
          context: contexts.TENANT_CREATE,
          details: {
            input: { ...tenantDto },
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
        context: contexts.TENANT_CREATE,
        details: {
          input: { ...tenantDto },
        },
      });

      throw repositoryError;
    }
  }

  async getTenantById(tenantId: string): Promise<ITenant | undefined> {
    try {
      return await this.sendFindByIdQuery(tenantId);
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.TENANT_GET_BY_ID,
        details: {
          input: { tenantId },
        },
      });

      throw repositoryError;
    }
  }

  async updateTenantById(
    tenantId: string,
    updateTenantDto: IUpdateTenantDto
  ): Promise<boolean> {
    try {
      const result = await this.sendUpdateByIdQuery(tenantId, updateTenantDto);

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.TENANT_UPDATE_BY_ID,
          details: {
            input: { tenantId, ...updateTenantDto },
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
        context: contexts.TENANT_UPDATE_BY_ID,
        details: {
          input: { tenantId, ...updateTenantDto },
        },
      });

      throw repositoryError;
    }
  }

  async removeTenantById(tenantId: string): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdQuery(tenantId);

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.TENANT_REMOVE_BY_ID,
          details: {
            input: { tenantId },
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
        context: contexts.TENANT_REMOVE_BY_ID,
        details: {
          input: { tenantId },
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
    tenantId: string
  ): Promise<ITenant | undefined> {
    return await this.dbClient<ITenant>(this.tableName)
      .where('id', tenantId)
      .first();
  }

  private async sendUpdateByIdQuery(
    tenantId: string,
    updateTenantDto: IUpdateTenantDto
  ): Promise<number> {
    return await this.dbClient(this.tableName)
      .where('id', tenantId)
      .update(updateTenantDto);
  }

  private async sendDeleteByIdQuery(tenantId: string): Promise<number> {
    return await this.dbClient(this.tableName).where('id', tenantId).del();
  }
}

export { TenantRepository };
