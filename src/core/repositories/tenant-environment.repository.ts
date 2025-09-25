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
  ICreateTenantEnvironmentDto,
  IGetTenantEnvironmentDto,
  IUpdateTenantEnvironmentAllowedDtos,
} from '../types/tenant-environment/dto.type';
import { ITenantEnvironmentRepository } from '../types/tenant-environment/repository.type';
import { ITenantEnvironment } from '../types/tenant-environment/tenant-environment.type';

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

  async getById(
    id: ITenantEnvironment['id']
  ): Promise<IGetTenantEnvironmentDto | undefined> {
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

  async getByIdAndTenantId(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId']
  ): Promise<IGetTenantEnvironmentDto | undefined> {
    try {
      return await this.sendFindByIdAndTenantIdQuery(id, tenantId);
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.TENANT_ENVIRONMENT_GET_BY_ID,
        details: {
          input: { id, tenantId },
        },
      });

      throw repositoryError;
    }
  }

  async getByTenantId(
    tenantId: ITenantEnvironment['tenantId']
  ): Promise<IGetTenantEnvironmentDto[] | undefined> {
    try {
      return await this.sendFindByTenantIdQuery(tenantId);
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.TENANT_ENVIRONMENT_GET_BY_TENANT_ID,
        details: {
          input: { tenantId },
        },
      });

      throw repositoryError;
    }
  }

  async updateByIdAndTenantId(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId'],
    dto: IUpdateTenantEnvironmentAllowedDtos
  ): Promise<boolean> {
    try {
      const result = await this.sendUpdateByIdAndTenantIdQuery(
        id,
        tenantId,
        dto
      );

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

  async deleteByIdAndTenantId(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId']
  ): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdAndTenantIdQuery(id, tenantId);

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

  async setCustomPropertyByIdAndTenantId(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId'],
    dto: ITenantEnvironment['customProperties']
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
        context: contexts.TENANT_ENVIRONMENT_SET_CUSTOM_PROPERTY_BY_ID,
        details: {
          input: { id, ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async deleteCustomPropertyByIdAndTenantId(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId'],
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
      .select('id', 'name', 'tenantId', 'customProperties')
      .first();
  }

  private async sendFindByIdAndTenantIdQuery(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId']
  ): Promise<IGetTenantEnvironmentDto | undefined> {
    return await this.dbClient<IGetTenantEnvironmentDto>(this.tableName)
      .where({ id, tenantId })
      .select('id', 'name', 'tenantId', 'customProperties')
      .first();
  }

  private async sendFindByTenantIdQuery(
    tenantId: ITenantEnvironment['tenantId']
  ): Promise<IGetTenantEnvironmentDto[] | undefined> {
    const result = await this.dbClient<IGetTenantEnvironmentDto>(this.tableName)
      .where('tenantId', tenantId)
      .select('id', 'name', 'tenantId', 'customProperties');

    if (!result.length) {
      return;
    }

    return result;
  }
  private async sendUpdateByIdAndTenantIdQuery(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId'],
    dto: IUpdateTenantEnvironmentAllowedDtos
  ): Promise<number> {
    return await this.dbClient(this.tableName)
      .where({ id, tenantId })
      .update(dto);
  }

  private async sendDeleteByIdQuery(
    id: ITenantEnvironment['id']
  ): Promise<number> {
    return await this.dbClient(this.tableName).where('id', id).del();
  }

  private async sendDeleteByIdAndTenantIdQuery(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId']
  ): Promise<number> {
    return await this.dbClient(this.tableName).where({ id, tenantId }).del();
  }

  private async sendSetJsonDataOnPathByIdAndTenantIdQuery(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId'],
    customProperty: ITenantEnvironment['customProperties']
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const key = Object.keys(customProperty)[0] as string;

    await this.dbClient(this.tableName)
      .where({ id, tenantId })
      .jsonSet('customProperties', `$.${key}`, customProperty);
  }

  private async sendDeleteJsonDataOnPathByIdAndTenantIdQuery(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId'],
    jsonPath: string
  ): Promise<void> {
    await this.dbClient(this.tableName)
      .where({ id, tenantId })
      .jsonRemove('customProperties', `$.${jsonPath}`);
  }
}

export { TenantEnvironmentRepository };
