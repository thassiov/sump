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
  ICreateTenantDto,
  IGetTenantDto,
  IUpdateTenantAllowedDtos,
} from './types/dto.type';
import { ITenantRepository } from './types/repository.type';
import { ITenant } from './types/tenant.type';

class TenantRepository extends BaseRepository implements ITenantRepository {
  private tableName: string;
  constructor(private readonly dbClient: Knex) {
    super('tenant-repository');
    this.tableName = internalConfigs.repository.tenant.tableName;
  }

  async create(
    dto: ICreateTenantDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    try {
      const [result] = await this.sendInsertReturningIdQuery(dto, transaction);

      if (!result) {
        throw new NotExpectedError({
          context: contexts.TENANT_CREATE,
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
        context: contexts.TENANT_CREATE,
        details: {
          input: { ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async getById(id: ITenant['id']): Promise<IGetTenantDto | undefined> {
    try {
      return await this.sendFindByIdQuery(id);
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.TENANT_GET_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async updateById(
    id: ITenant['id'],
    dto: IUpdateTenantAllowedDtos
  ): Promise<boolean> {
    try {
      const result = await this.sendUpdateByIdQuery(id, dto);

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.TENANT_UPDATE_BY_ID,
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
        context: contexts.TENANT_UPDATE_BY_ID,
        details: {
          input: { id, ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async deleteById(id: ITenant['id']): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdQuery(id);

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.TENANT_DELETE_BY_ID,
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
        context: contexts.TENANT_DELETE_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async setCustomPropertyById(
    id: ITenant['id'],
    dto: ITenant['customProperties']
  ): Promise<boolean> {
    try {
      await this.sendSetJsonDataOnPathById(id, dto);

      return true;
    } catch (error) {
      if (error instanceof BaseCustomError) {
        throw error;
      }

      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.TENANT_SET_CUSTOM_PROPERTY_BY_ID,
        details: {
          input: { id, ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async deleteCustomPropertyById(
    id: ITenant['id'],
    customPropertyKey: string
  ): Promise<boolean> {
    try {
      await this.sendDeleteJsonDataOnPathById(id, customPropertyKey);

      return true;
    } catch (error) {
      if (error instanceof BaseCustomError) {
        throw error;
      }

      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.TENANT_DELETE_CUSTOM_PROPERTY_BY_ID,
        details: {
          input: { id, customPropertyKey },
        },
      });

      throw repositoryError;
    }
  }

  private async sendInsertReturningIdQuery(
    payload: ICreateTenantDto,
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
    id: ITenant['id']
  ): Promise<IGetTenantDto | undefined> {
    return await this.dbClient<IGetTenantDto>(this.tableName)
      .where('id', id)
      .first();
  }

  private async sendUpdateByIdQuery(
    id: ITenant['id'],
    dto: IUpdateTenantAllowedDtos
  ): Promise<number> {
    return await this.dbClient(this.tableName).where('id', id).update(dto);
  }

  private async sendDeleteByIdQuery(id: ITenant['id']): Promise<number> {
    return await this.dbClient(this.tableName).where('id', id).del();
  }

  private async sendSetJsonDataOnPathById(
    id: ITenant['id'],
    customProperty: ITenant['customProperties']
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const key = Object.keys(customProperty)[0] as string;

    await this.dbClient(this.tableName)
      .where('id', id)
      .jsonSet('customProperties', `$.${key}`, customProperty);
  }

  private async sendDeleteJsonDataOnPathById(
    id: ITenant['id'],
    jsonPath: string
  ): Promise<void> {
    await this.dbClient(this.tableName)
      .where('id', id)
      .jsonRemove('customProperties', `$.${jsonPath}`);
  }
}

export { TenantRepository };
