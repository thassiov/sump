import { Knex } from 'knex';
import { DatabaseError } from 'pg';
import { IInsertReturningId } from '../../infra/database/postgres/types';
import { BaseRepository } from '../../lib/base-classes';
import { internalConfigs } from '../../lib/config';
import { contexts } from '../../lib/contexts';
import {
  ConflictError,
  NotExpectedError,
  NotFoundError,
  UnexpectedError,
} from '../../lib/errors';
import { BaseCustomError } from '../../lib/errors/base-custom-error.error';
import {
  ICreateTenantEnvironmentAccountDto,
  IGetTenantEnvironmentAccountDto,
  IUpdateTenantEnvironmentAccountAllowedDtos,
} from '../types/tenant-environment-account/dto.type';
import { ITenantEnvironmentAccountRepository } from '../types/tenant-environment-account/repository.type';
import { ITenantEnvironmentAccount } from '../types/tenant-environment-account/tenant-environment-account.type';

class TenantEnvironmentAccountRepository
  extends BaseRepository
  implements ITenantEnvironmentAccountRepository
{
  private tableName: string;
  constructor(private readonly dbClient: Knex) {
    super('account-repository');
    this.tableName = internalConfigs.repository.account.tableName;
  }

  async create(
    dto: ICreateTenantEnvironmentAccountDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    try {
      const [result] = await this.sendInsertReturningIdQuery(dto, transaction);

      if (!result) {
        throw new NotExpectedError({
          context: contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE,
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

      if (error instanceof DatabaseError) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (error.detail!.endsWith('already exists.')) {
          const conflictError = new ConflictError({
            cause: error as Error,
            context: contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE,
            details: {
              input: { ...dto },
              message: 'User identification already in use',
            },
          });

          throw conflictError;
        }
      }

      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_CREATE,
        details: {
          input: { ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async getById(
    id: ITenantEnvironmentAccount['id']
  ): Promise<IGetTenantEnvironmentAccountDto | undefined> {
    try {
      return await this.sendFindByIdQuery(id);
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_GET_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async updateById(
    id: ITenantEnvironmentAccount['id'],
    dto: IUpdateTenantEnvironmentAccountAllowedDtos
  ): Promise<boolean> {
    try {
      const result = await this.sendUpdateByIdQuery(id, dto);

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_BY_ID,
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
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_UPDATE_BY_ID,
        details: {
          input: { id, ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async deleteById(id: ITenantEnvironmentAccount['id']): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdQuery(id);

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.TENANT_ENVIRONMENT_ACCOUNT_DELETE_BY_ID,
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
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_DELETE_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async setCustomPropertyById(
    id: ITenantEnvironmentAccount['id'],
    dto: ITenantEnvironmentAccount['customProperties']
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
        context: contexts.TENANT_ENVIRONMENT_ACCOUNT_SET_CUSTOM_PROPERTY_BY_ID,
        details: {
          input: { id, ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async deleteCustomPropertyById(
    id: ITenantEnvironmentAccount['id'],
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
        context:
          contexts.TENANT_ENVIRONMENT_ACCOUNT_DELETE_CUSTOM_PROPERTY_BY_ID,
        details: {
          input: { id, customPropertyKey },
        },
      });

      throw repositoryError;
    }
  }

  private async sendInsertReturningIdQuery(
    payload: ICreateTenantEnvironmentAccountDto,
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
    id: ITenantEnvironmentAccount['id']
  ): Promise<IGetTenantEnvironmentAccountDto | undefined> {
    return await this.dbClient<IGetTenantEnvironmentAccountDto>(this.tableName)
      .where('id', id)
      .first();
  }

  private async sendUpdateByIdQuery(
    id: ITenantEnvironmentAccount['id'],
    dto: IUpdateTenantEnvironmentAccountAllowedDtos
  ): Promise<number> {
    return await this.dbClient(this.tableName).where('id', id).update(dto);
  }

  private async sendDeleteByIdQuery(id: string): Promise<number> {
    return await this.dbClient(this.tableName).where('id', id).del();
  }

  private async sendSetJsonDataOnPathById(
    id: ITenantEnvironmentAccount['id'],
    customProperty: ITenantEnvironmentAccount['customProperties']
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const key = Object.keys(customProperty)[0] as string;

    await this.dbClient(this.tableName)
      .where('id', id)
      .jsonSet('customProperties', `$.${key}`, customProperty);
  }

  private async sendDeleteJsonDataOnPathById(
    id: ITenantEnvironmentAccount['id'],
    jsonPath: string
  ): Promise<void> {
    await this.dbClient(this.tableName)
      .where('id', id)
      .jsonRemove('customProperties', `$.${jsonPath}`);
  }
}

export { TenantEnvironmentAccountRepository };
