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
  IGetTenantEnvironmentDto,
  IUpdateTenantEnvironmentAllowedDtos,
} from './types/dto.type';
import { ITenantEnvironmentRepository } from './types/repository.type';
import { ITenantEnvironment } from './types/tenant-environment.type';

class TenantEnvironmentRepository
  extends BaseRepository
  implements ITenantEnvironmentRepository
{
  private tableName: string;
  constructor(private readonly dbClient: Knex) {
    super('tenant-environment-repository');
    this.tableName = internalConfigs.repository.tenantEnvironment.tableName;
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

  async getById(id: string): Promise<IGetTenantEnvironmentDto | undefined> {
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
    id: ITenantEnvironment['id'],
    dto: IUpdateTenantEnvironmentAllowedDtos
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

  async deleteById(id: ITenantEnvironment['id']): Promise<boolean> {
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

  async setCustomPropertyById(
    id: ITenantEnvironment['id'],
    dto: ITenantEnvironment['customProperties']
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
        context: contexts.TENANT_ENVIRONMENT_SET_CUSTOM_PROPERTY_BY_ID,
        details: {
          input: { id, ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async deleteCustomPropertyById(
    id: ITenantEnvironment['id'],
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
        context: contexts.TENANT_ENVIRONMENT_DELETE_CUSTOM_PROPERTY_BY_ID,
        details: {
          input: { id, customPropertyKey },
        },
      });

      throw repositoryError;
    }
  }

  private async sendInsertReturningIdQuery(
    payload: ICreateTenantEnvironmentDto,
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
    id: ITenantEnvironment['id']
  ): Promise<IGetTenantEnvironmentDto | undefined> {
    return await this.dbClient<IGetTenantEnvironmentDto>(this.tableName)
      .where('id', id)
      .first();
  }

  private async sendUpdateByIdQuery(
    id: ITenantEnvironment['id'],
    dto: IUpdateTenantEnvironmentAllowedDtos
  ): Promise<number> {
    return await this.dbClient(this.tableName).where('id', id).update(dto);
  }

  private async sendDeleteByIdQuery(
    id: ITenantEnvironment['id']
  ): Promise<number> {
    return await this.dbClient(this.tableName).where('id', id).del();
  }

  private async sendSetJsonDataOnPathById(
    id: ITenantEnvironment['id'],
    customProperty: ITenantEnvironment['customProperties']
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const key = Object.keys(customProperty)[0] as string;

    await this.dbClient(this.tableName)
      .where('id', id)
      .jsonSet('customProperties', `$.${key}`, customProperty);
  }

  private async sendDeleteJsonDataOnPathById(
    id: ITenantEnvironment['id'],
    jsonPath: string
  ): Promise<void> {
    await this.dbClient(this.tableName)
      .where('id', id)
      .jsonRemove('customProperties', `$.${jsonPath}`);
  }
}

export { TenantEnvironmentRepository };
