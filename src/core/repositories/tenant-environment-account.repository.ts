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

  async getByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId']
  ): Promise<IGetTenantEnvironmentAccountDto | undefined> {
    try {
      return await this.sendFindByIdAndTenantEnvironmentIdQuery(
        id,
        tenantEnvironmentId
      );
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

  async updateByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: IUpdateTenantEnvironmentAccountAllowedDtos
  ): Promise<boolean> {
    try {
      const result = await this.sendUpdateByIdAndTenantEnvironmentIdQuery(
        id,
        tenantEnvironmentId,
        dto
      );

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

  async deleteByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId']
  ): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdAndTenantEnvironmentIdQuery(
        id,
        tenantEnvironmentId
      );

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

  async deleteCustomPropertyByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId']
  ): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdAndTenantEnvironmentIdQuery(
        id,
        tenantEnvironmentId
      );

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

  async setCustomPropertyByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: ITenantEnvironmentAccount['customProperties']
  ): Promise<boolean> {
    try {
      await this.sendSetJsonDataOnPathByIdAndTenantEnvironmentIdQuery(
        id,
        tenantEnvironmentId,
        dto
      );

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
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    customPropertyKey: string
  ): Promise<boolean> {
    try {
      await this.sendDeleteJsonDataOnPathByIdAndTenantEnvironmentIdQuery(
        id,
        tenantEnvironmentId,
        customPropertyKey
      );

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

  private async sendFindByIdAndTenantEnvironmentIdQuery(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId']
  ): Promise<IGetTenantEnvironmentAccountDto | undefined> {
    return await this.dbClient<IGetTenantEnvironmentAccountDto>(this.tableName)
      .where({ id, tenantEnvironmentId })
      .first();
  }

  private async sendUpdateByIdAndTenantEnvironmentIdQuery(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: IUpdateTenantEnvironmentAccountAllowedDtos
  ): Promise<number> {
    return await this.dbClient(this.tableName)
      .where({ id, tenantEnvironmentId })
      .update(dto);
  }

  private async sendDeleteByIdQuery(
    id: ITenantEnvironmentAccount['id']
  ): Promise<number> {
    return await this.dbClient(this.tableName).where('id', id).del();
  }

  private async sendDeleteByIdAndTenantEnvironmentIdQuery(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId']
  ): Promise<number> {
    return await this.dbClient(this.tableName)
      .where({ id, tenantEnvironmentId })
      .del();
  }

  private async sendSetJsonDataOnPathByIdAndTenantEnvironmentIdQuery(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    customProperty: ITenantEnvironmentAccount['customProperties']
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const key = Object.keys(customProperty)[0] as string;

    await this.dbClient(this.tableName)
      .where({ id, tenantEnvironmentId })
      .jsonSet('customProperties', `$.${key}`, customProperty);
  }

  private async sendDeleteJsonDataOnPathByIdAndTenantEnvironmentIdQuery(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    jsonPath: string
  ): Promise<void> {
    await this.dbClient(this.tableName)
      .where({ id, tenantEnvironmentId })
      .jsonRemove('customProperties', `$.${jsonPath}`);
  }
}

export { TenantEnvironmentAccountRepository };
