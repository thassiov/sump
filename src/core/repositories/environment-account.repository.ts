import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CLIENT } from '../../common/database/database.module';
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
  ICreateEnvironmentAccountDto,
  IGetEnvironmentAccountDto,
  IUpdateEnvironmentAccountAllowedDtos,
} from '../types/environment-account/dto.type';
import { IEnvironmentAccountRepository } from '../types/environment-account/repository.type';
import { IEnvironmentAccount } from '../types/environment-account/environment-account.type';

@Injectable()
class EnvironmentAccountRepository
  extends BaseRepository
  implements IEnvironmentAccountRepository
{
  private tableName: string;
  constructor(@Inject(DATABASE_CLIENT) private readonly dbClient: Knex) {
    super('account-repository');
    this.tableName = internalConfigs.repository.environmentAccount.tableName;
  }

  async create(
    dto: ICreateEnvironmentAccountDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    try {
      const [result] = await this.sendInsertReturningIdQuery(dto, transaction);

      if (!result) {
        throw new NotExpectedError({
          context: contexts.ENVIRONMENT_ACCOUNT_CREATE,
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
            context: contexts.ENVIRONMENT_ACCOUNT_CREATE,
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
        context: contexts.ENVIRONMENT_ACCOUNT_CREATE,
        details: {
          input: { ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async getById(
    id: IEnvironmentAccount['id']
  ): Promise<IGetEnvironmentAccountDto | undefined> {
    try {
      return await this.sendFindByIdQuery(id);
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.ENVIRONMENT_ACCOUNT_GET_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async getByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ): Promise<IGetEnvironmentAccountDto | undefined> {
    try {
      return await this.sendFindByIdAndTenantEnvironmentIdQuery(
        id,
        environmentId
      );
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.ENVIRONMENT_ACCOUNT_GET_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async updateByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateEnvironmentAccountAllowedDtos
  ): Promise<boolean> {
    try {
      const result = await this.sendUpdateByIdAndTenantEnvironmentIdQuery(
        id,
        environmentId,
        dto
      );

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.ENVIRONMENT_ACCOUNT_UPDATE_BY_ID,
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
        context: contexts.ENVIRONMENT_ACCOUNT_UPDATE_BY_ID,
        details: {
          input: { id, ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async deleteById(id: IEnvironmentAccount['id']): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdQuery(id);

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.ENVIRONMENT_ACCOUNT_DELETE_BY_ID,
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
        context: contexts.ENVIRONMENT_ACCOUNT_DELETE_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async deleteByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdAndTenantEnvironmentIdQuery(
        id,
        environmentId
      );

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.ENVIRONMENT_ACCOUNT_DELETE_BY_ID,
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
        context: contexts.ENVIRONMENT_ACCOUNT_DELETE_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async deleteCustomPropertyByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    _customPropertyKey: string
  ): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdAndTenantEnvironmentIdQuery(
        id,
        environmentId
      );

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.ENVIRONMENT_ACCOUNT_DELETE_BY_ID,
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
        context: contexts.ENVIRONMENT_ACCOUNT_DELETE_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async setCustomPropertyByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IEnvironmentAccount['customProperties']
  ): Promise<boolean> {
    try {
      await this.sendSetJsonDataOnPathByIdAndTenantEnvironmentIdQuery(
        id,
        environmentId,
        dto
      );

      return true;
    } catch (error) {
      if (error instanceof BaseCustomError) {
        throw error;
      }

      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.ENVIRONMENT_ACCOUNT_SET_CUSTOM_PROPERTY_BY_ID,
        details: {
          input: { id, ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async deleteCustomPropertyById(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    customPropertyKey: string
  ): Promise<boolean> {
    try {
      await this.sendDeleteJsonDataOnPathByIdAndTenantEnvironmentIdQuery(
        id,
        environmentId,
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
          contexts.ENVIRONMENT_ACCOUNT_DELETE_CUSTOM_PROPERTY_BY_ID,
        details: {
          input: { id, customPropertyKey },
        },
      });

      throw repositoryError;
    }
  }

  private async sendInsertReturningIdQuery(
    payload: ICreateEnvironmentAccountDto,
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
    id: IEnvironmentAccount['id']
  ): Promise<IGetEnvironmentAccountDto | undefined> {
    return await this.dbClient<IGetEnvironmentAccountDto>(this.tableName)
      .where('id', id)
      .first();
  }

  private async sendFindByIdAndTenantEnvironmentIdQuery(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ): Promise<IGetEnvironmentAccountDto | undefined> {
    return await this.dbClient<IGetEnvironmentAccountDto>(this.tableName)
      .where({ id, environmentId })
      .first();
  }

  private async sendUpdateByIdAndTenantEnvironmentIdQuery(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateEnvironmentAccountAllowedDtos
  ): Promise<number> {
    return await this.dbClient(this.tableName)
      .where({ id, environmentId })
      .update(dto);
  }

  private async sendDeleteByIdQuery(
    id: IEnvironmentAccount['id']
  ): Promise<number> {
    return await this.dbClient(this.tableName).where('id', id).del();
  }

  private async sendDeleteByIdAndTenantEnvironmentIdQuery(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ): Promise<number> {
    return await this.dbClient(this.tableName)
      .where({ id, environmentId })
      .del();
  }

  private async sendSetJsonDataOnPathByIdAndTenantEnvironmentIdQuery(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    customProperty: IEnvironmentAccount['customProperties']
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const key = Object.keys(customProperty)[0] as string;

    await this.dbClient(this.tableName)
      .where({ id, environmentId })
      .jsonSet('customProperties', `$.${key}`, customProperty);
  }

  private async sendDeleteJsonDataOnPathByIdAndTenantEnvironmentIdQuery(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    jsonPath: string
  ): Promise<void> {
    await this.dbClient(this.tableName)
      .where({ id, environmentId })
      .jsonRemove('customProperties', `$.${jsonPath}`);
  }
}

export { EnvironmentAccountRepository };
