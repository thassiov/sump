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
import { IAccount } from '../types/account/account.type';
import {
  IAccountUserDefinedIdentification,
  ICreateAccountDto,
  IGetAccountDto,
  IUpdateAccountAllowedDtos,
} from '../types/account/dto.type';
import { IAccountRepository } from '../types/account/repository.type';

class AccountRepository extends BaseRepository implements IAccountRepository {
  private tableName: string;
  constructor(private readonly dbClient: Knex) {
    super('account-repository');
    this.tableName = internalConfigs.repository.account.tableName;
  }

  async create(
    dto: ICreateAccountDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    try {
      const [result] = await this.sendInsertReturningIdQuery(
        { ...dto, roles: JSON.stringify(dto.roles) },
        transaction
      );

      if (!result) {
        throw new NotExpectedError({
          context: contexts.ACCOUNT_CREATE,
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
            context: contexts.ACCOUNT_CREATE,
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
        context: contexts.ACCOUNT_CREATE,
        details: {
          input: { ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async getById(id: IAccount['id']): Promise<IGetAccountDto | undefined> {
    try {
      return await this.sendFindByIdQuery(id);
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.ACCOUNT_GET_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async getByTenantId(
    tenantId: IAccount['tenantId']
  ): Promise<IGetAccountDto[] | undefined> {
    try {
      return await this.sendFindByTenantIdQuery(tenantId);
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.ACCOUNT_GET_BY_TENANT_ID,
        details: {
          input: { tenantId },
        },
      });

      throw repositoryError;
    }
  }

  async getByAccountIdAndTenantId(
    accountId: IAccount['id'],
    tenantId: IAccount['tenantId']
  ): Promise<IGetAccountDto | undefined> {
    try {
      return await this.sendFindByAccountIdAndTenantIdQuery(
        accountId,
        tenantId
      );
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.ACCOUNT_GET_BY_ACCOUNT_ID_AND_TENANT_ID,
        details: {
          input: { accountId, tenantId },
        },
      });

      throw repositoryError;
    }
  }

  async getByUserDefinedIdentificationAndTenantId(
    dto: IAccountUserDefinedIdentification,
    tenantId: IAccount['tenantId']
  ): Promise<IGetAccountDto[] | undefined> {
    try {
      return await this.sendFindByUserDefinedIdentificationAndTenantIdQuery(
        dto,
        tenantId
      );
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.ACCOUNT_GET_BY_USER_DEFINED_IDENTIFICATION,
        details: {
          input: { ...dto, tenantId },
        },
      });

      throw repositoryError;
    }
  }

  async updateByIdAndTenantId(
    id: IAccount['id'],
    tenantId: IAccount['tenantId'],
    dto: IUpdateAccountAllowedDtos
  ): Promise<boolean> {
    try {
      const result = await this.sendUpdateByIdAndTenantIdQuery(
        id,
        tenantId,
        dto
      );

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.ACCOUNT_UPDATE_BY_ID,
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
        context: contexts.ACCOUNT_UPDATE_BY_ID,
        details: {
          input: { id, ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async deleteById(id: IAccount['id']): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdQuery(id);

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.ACCOUNT_DELETE_BY_ID,
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
        context: contexts.ACCOUNT_DELETE_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async deleteByIdAndTenantId(
    id: IAccount['id'],
    tenantId: IAccount['tenantId']
  ): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdAndTenantIdQuery(id, tenantId);

      if (result === 0) {
        throw new NotFoundError({
          // @TODO: add a 'delete account by id and tenant id' context here
          // context: contexts.ACCOUNT_DELETE_BY_ID,
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
        // context: contexts.ACCOUNT_DELETE_BY_ID,
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
    id: IAccount['id']
  ): Promise<IGetAccountDto | undefined> {
    return await this.dbClient<IGetAccountDto>(this.tableName)
      .where('id', id)
      .select(
        'id',
        'name',
        'username',
        'phone',
        'email',
        'roles',
        'tenantId',
        'avatarUrl'
      )
      .first();
  }

  private async sendFindByTenantIdQuery(
    tenantId: IAccount['tenantId']
  ): Promise<IGetAccountDto[] | undefined> {
    return await this.dbClient<IGetAccountDto[]>(this.tableName)
      .where('tenantId', tenantId)
      .select(
        'id',
        'name',
        'username',
        'phone',
        'email',
        'roles',
        'tenantId',
        'avatarUrl'
      );
  }

  private async sendFindByAccountIdAndTenantIdQuery(
    accountId: IAccount['id'],
    tenantId: IAccount['tenantId']
  ): Promise<IGetAccountDto | undefined> {
    return await this.dbClient<IGetAccountDto>(this.tableName)
      .where({ tenantId, id: accountId })
      .select(
        'id',
        'name',
        'username',
        'phone',
        'email',
        'roles',
        'tenantId',
        'avatarUrl'
      );
  }

  private async sendFindByUserDefinedIdentificationAndTenantIdQuery(
    dto: IAccountUserDefinedIdentification,
    tenantId: IAccount['tenantId']
  ): Promise<IGetAccountDto[] | undefined> {
    let query = this.dbClient<IGetAccountDto>(this.tableName);

    const wheres = Object.entries(dto) as [string, string][];

    wheres.forEach(([key, value], index: number) => {
      if (index === 0) {
        query = query.where(key, value);
        return;
      }
      query = query.orWhere(key, value);
      return;
    });

    query.andWhere({ tenantId });

    const result = await query;

    if (!result.length) {
      return;
    }

    return result;
  }

  private async sendUpdateByIdAndTenantIdQuery(
    id: IAccount['id'],
    tenantId: IAccount['tenantId'],
    dto: IUpdateAccountAllowedDtos
  ): Promise<number> {
    return this.dbClient(this.tableName).where({ id, tenantId }).update(dto);
  }

  private async sendDeleteByIdQuery(id: IAccount['id']): Promise<number> {
    return await this.dbClient(this.tableName).where('id', id).del();
  }

  private async sendDeleteByIdAndTenantIdQuery(
    id: IAccount['id'],
    tenantId: IAccount['tenantId']
  ): Promise<number> {
    return await this.dbClient(this.tableName).where({ id, tenantId }).del();
  }
}

export { AccountRepository };
