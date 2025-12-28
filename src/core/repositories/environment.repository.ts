import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CLIENT } from '../../common/database/database.module';
import { Knex } from 'knex';
import { IInsertReturningId } from '../../infra/database/postgres/types';
import { BaseRepository } from '../../lib/base-classes';
import { internalConfigs } from '../../lib/config';
import { contexts } from '../../lib/contexts';
import {
  NotExpectedError,
  NotFoundError,
  UnexpectedError,
} from '../../lib/errors';
import { BaseCustomError } from '../../lib/errors/base-custom-error.error';
import {
  ICreateEnvironmentDto,
  IGetEnvironmentDto,
  IUpdateEnvironmentAllowedDtos,
} from '../types/environment/dto.type';
import { IEnvironmentRepository } from '../types/environment/repository.type';
import { IEnvironment } from '../types/environment/environment.type';

@Injectable()
class EnvironmentRepository
  extends BaseRepository
  implements IEnvironmentRepository
{
  private tableName: string;
  constructor(@Inject(DATABASE_CLIENT) private readonly dbClient: Knex) {
    super('environment-repository');
    this.tableName = internalConfigs.repository.environment.tableName;
  }

  async create(
    dto: ICreateEnvironmentDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    try {
      const [result] = await this.sendInsertReturningIdQuery(dto, transaction);

      if (!result) {
        throw new NotExpectedError({
          context: contexts.ENVIRONMENT_CREATE,
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
        context: contexts.ENVIRONMENT_CREATE,
        details: {
          input: { ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async getById(
    id: IEnvironment['id']
  ): Promise<IGetEnvironmentDto | undefined> {
    try {
      return await this.sendFindByIdQuery(id);
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.ENVIRONMENT_GET_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async getByIdAndTenantId(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId']
  ): Promise<IGetEnvironmentDto | undefined> {
    try {
      return await this.sendFindByIdAndTenantIdQuery(id, tenantId);
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.ENVIRONMENT_GET_BY_ID,
        details: {
          input: { id, tenantId },
        },
      });

      throw repositoryError;
    }
  }

  async getByTenantId(
    tenantId: IEnvironment['tenantId']
  ): Promise<IGetEnvironmentDto[] | undefined> {
    try {
      return await this.sendFindByTenantIdQuery(tenantId);
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.ENVIRONMENT_GET_BY_TENANT_ID,
        details: {
          input: { tenantId },
        },
      });

      throw repositoryError;
    }
  }

  async updateByIdAndTenantId(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId'],
    dto: IUpdateEnvironmentAllowedDtos
  ): Promise<boolean> {
    try {
      const result = await this.sendUpdateByIdAndTenantIdQuery(
        id,
        tenantId,
        dto
      );

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.ENVIRONMENT_UPDATE_BY_ID,
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
        context: contexts.ENVIRONMENT_UPDATE_BY_ID,
        details: {
          input: { id, ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async deleteById(id: IEnvironment['id']): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdQuery(id);

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.ENVIRONMENT_DELETE_BY_ID,
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
        context: contexts.ENVIRONMENT_DELETE_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async deleteByIdAndTenantId(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId']
  ): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdAndTenantIdQuery(id, tenantId);

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.ENVIRONMENT_DELETE_BY_ID,
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
        context: contexts.ENVIRONMENT_DELETE_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async setCustomPropertyByIdAndTenantId(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId'],
    dto: IEnvironment['customProperties']
  ): Promise<boolean> {
    try {
      await this.sendSetJsonDataOnPathByIdAndTenantIdQuery(id, tenantId, dto);

      return true;
    } catch (error) {
      if (error instanceof BaseCustomError) {
        throw error;
      }

      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.ENVIRONMENT_SET_CUSTOM_PROPERTY_BY_ID,
        details: {
          input: { id, ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async deleteCustomPropertyByIdAndTenantId(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId'],
    customPropertyKey: string
  ): Promise<boolean> {
    try {
      await this.sendDeleteJsonDataOnPathByIdAndTenantIdQuery(
        id,
        tenantId,
        customPropertyKey
      );

      return true;
    } catch (error) {
      if (error instanceof BaseCustomError) {
        throw error;
      }

      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.ENVIRONMENT_DELETE_CUSTOM_PROPERTY_BY_ID,
        details: {
          input: { id, customPropertyKey },
        },
      });

      throw repositoryError;
    }
  }

  private async sendInsertReturningIdQuery(
    payload: ICreateEnvironmentDto,
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
    id: IEnvironment['id']
  ): Promise<IGetEnvironmentDto | undefined> {
    return await this.dbClient<IGetEnvironmentDto>(this.tableName)
      .where('id', id)
      .select('id', 'name', 'tenantId', 'customProperties')
      .first();
  }

  private async sendFindByIdAndTenantIdQuery(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId']
  ): Promise<IGetEnvironmentDto | undefined> {
    return await this.dbClient<IGetEnvironmentDto>(this.tableName)
      .where({ id, tenantId })
      .select('id', 'name', 'tenantId', 'customProperties')
      .first();
  }

  private async sendFindByTenantIdQuery(
    tenantId: IEnvironment['tenantId']
  ): Promise<IGetEnvironmentDto[] | undefined> {
    const result = await this.dbClient<IGetEnvironmentDto>(this.tableName)
      .where('tenantId', tenantId)
      .select('id', 'name', 'tenantId', 'customProperties');

    if (!result.length) {
      return;
    }

    return result;
  }
  private async sendUpdateByIdAndTenantIdQuery(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId'],
    dto: IUpdateEnvironmentAllowedDtos
  ): Promise<number> {
    return await this.dbClient(this.tableName)
      .where({ id, tenantId })
      .update(dto);
  }

  private async sendDeleteByIdQuery(
    id: IEnvironment['id']
  ): Promise<number> {
    return await this.dbClient(this.tableName).where('id', id).del();
  }

  private async sendDeleteByIdAndTenantIdQuery(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId']
  ): Promise<number> {
    return await this.dbClient(this.tableName).where({ id, tenantId }).del();
  }

  private async sendSetJsonDataOnPathByIdAndTenantIdQuery(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId'],
    customProperty: IEnvironment['customProperties']
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const key = Object.keys(customProperty)[0] as string;
    // Value must be JSON stringified for jsonb_set
    const value = JSON.stringify(customProperty[key]);

    await this.dbClient(this.tableName)
      .where({ id, tenantId })
      .update({
        customProperties: this.dbClient.jsonSet(
          'customProperties',
          `$.${key}`,
          value
        ),
      });
  }

  private async sendDeleteJsonDataOnPathByIdAndTenantIdQuery(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId'],
    jsonPath: string
  ): Promise<void> {
    await this.dbClient(this.tableName)
      .where({ id, tenantId })
      .update({
        customProperties: this.dbClient.jsonRemove(
          'customProperties',
          `$.${jsonPath}`
        ),
      });
  }
}

export { EnvironmentRepository };
