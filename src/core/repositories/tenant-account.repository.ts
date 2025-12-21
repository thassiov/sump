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
import { ITenantAccount, ITenantAccountRole } from '../types/tenant-account/tenant-account.type';
import {
  ITenantAccountUserDefinedIdentification,
  ICreateTenantAccountDto,
  IGetTenantAccountDto,
  IUpdateTenantAccountAllowedDtos,
} from '../types/tenant-account/dto.type';
import { ITenantAccountRepository } from '../types/tenant-account/repository.type';

@Injectable()
class TenantAccountRepository extends BaseRepository implements ITenantAccountRepository {
  private tableName: string;
  constructor(@Inject(DATABASE_CLIENT) private readonly dbClient: Knex) {
    super('tenant-account-repository');
    this.tableName = internalConfigs.repository.tenantAccount.tableName;
  }

  async create(
    dto: ICreateTenantAccountDto,
    transaction?: Knex.Transaction
  ): Promise<string> {
    try {
      const [result] = await this.sendInsertReturningIdQuery(
        { ...dto, roles: JSON.stringify(dto.roles) },
        transaction
      );

      if (!result) {
        throw new NotExpectedError({
          context: contexts.TENANT_ACCOUNT_CREATE,
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
            context: contexts.TENANT_ACCOUNT_CREATE,
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
        context: contexts.TENANT_ACCOUNT_CREATE,
        details: {
          input: { ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async getById(id: ITenantAccount['id']): Promise<IGetTenantAccountDto | undefined> {
    try {
      return await this.sendFindByIdQuery(id);
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.TENANT_ACCOUNT_GET_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async getByTenantId(
    tenantId: ITenantAccount['tenantId']
  ): Promise<IGetTenantAccountDto[] | undefined> {
    try {
      return await this.sendFindByTenantIdQuery(tenantId);
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.TENANT_ACCOUNT_GET_BY_TENANT_ID,
        details: {
          input: { tenantId },
        },
      });

      throw repositoryError;
    }
  }

  async getByAccountIdAndTenantId(
    accountId: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId']
  ): Promise<IGetTenantAccountDto | undefined> {
    try {
      return await this.sendFindByAccountIdAndTenantIdQuery(
        accountId,
        tenantId
      );
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.TENANT_ACCOUNT_GET_BY_ACCOUNT_ID_AND_TENANT_ID,
        details: {
          input: { accountId, tenantId },
        },
      });

      throw repositoryError;
    }
  }

  async getByUserDefinedIdentificationAndTenantId(
    dto: ITenantAccountUserDefinedIdentification,
    tenantId: ITenantAccount['tenantId']
  ): Promise<IGetTenantAccountDto[] | undefined> {
    try {
      return await this.sendFindByUserDefinedIdentificationAndTenantIdQuery(
        dto,
        tenantId
      );
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.TENANT_ACCOUNT_GET_BY_USER_DEFINED_IDENTIFICATION,
        details: {
          input: { ...dto, tenantId },
        },
      });

      throw repositoryError;
    }
  }

  async getByUserDefinedIdentification(
    dto: ITenantAccountUserDefinedIdentification
  ): Promise<IGetTenantAccountDto[] | undefined> {
    try {
      return await this.sendFindByUserDefinedIdentificationQuery(dto);
    } catch (error) {
      const repositoryError = new UnexpectedError({
        cause: error as Error,
        context: contexts.TENANT_ACCOUNT_GET_BY_USER_DEFINED_IDENTIFICATION,
        details: {
          input: { ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async updateByIdAndTenantId(
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId'],
    dto: IUpdateTenantAccountAllowedDtos
  ): Promise<boolean> {
    try {
      const result = await this.sendUpdateByIdAndTenantIdQuery(
        id,
        tenantId,
        dto
      );

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.TENANT_ACCOUNT_UPDATE_BY_ID,
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
        context: contexts.TENANT_ACCOUNT_UPDATE_BY_ID,
        details: {
          input: { id, ...dto },
        },
      });

      throw repositoryError;
    }
  }

  async deleteById(id: ITenantAccount['id']): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdQuery(id);

      if (result === 0) {
        throw new NotFoundError({
          context: contexts.TENANT_ACCOUNT_DELETE_BY_ID,
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
        context: contexts.TENANT_ACCOUNT_DELETE_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async deleteByIdAndTenantId(
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId']
  ): Promise<boolean> {
    try {
      const result = await this.sendDeleteByIdAndTenantIdQuery(id, tenantId);

      if (result === 0) {
        throw new NotFoundError({
          // @TODO: add a 'delete account by id and tenant id' context here
          // context: contexts.TENANT_ACCOUNT_DELETE_BY_ID,
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
        // context: contexts.TENANT_ACCOUNT_DELETE_BY_ID,
        details: {
          input: { id },
        },
      });

      throw repositoryError;
    }
  }

  async getAccountsByRoleAndByTenantId(
    tenantId: ITenantAccount['tenantId'],
    role: ITenantAccountRole
  ): Promise<IGetTenantAccountDto[]> {
    try {
      return await this.sendGetAccountsByRoleAndTenantIdQuery(tenantId, role);
    } catch (error) {
      if (error instanceof BaseCustomError) {
        throw error;
      }

      const repositoryError = new UnexpectedError({
        cause: error as Error,
        // context: contexts.TENANT_ACCOUNT_DELETE_BY_ID,
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
    id: ITenantAccount['id']
  ): Promise<IGetTenantAccountDto | undefined> {
    return await this.dbClient<IGetTenantAccountDto>(this.tableName)
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
    tenantId: ITenantAccount['tenantId']
  ): Promise<IGetTenantAccountDto[] | undefined> {
    return await this.dbClient<IGetTenantAccountDto[]>(this.tableName)
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
    accountId: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId']
  ): Promise<IGetTenantAccountDto | undefined> {
    return await this.dbClient<IGetTenantAccountDto>(this.tableName)
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
      )
      .first();
  }

  private async sendFindByUserDefinedIdentificationAndTenantIdQuery(
    dto: ITenantAccountUserDefinedIdentification,
    tenantId: ITenantAccount['tenantId']
  ): Promise<IGetTenantAccountDto[] | undefined> {
    let query = this.dbClient<IGetTenantAccountDto>(this.tableName);

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

  private async sendFindByUserDefinedIdentificationQuery(
    dto: ITenantAccountUserDefinedIdentification
  ): Promise<IGetTenantAccountDto[] | undefined> {
    let query = this.dbClient<IGetTenantAccountDto>(this.tableName);

    const wheres = Object.entries(dto) as [string, string][];

    wheres.forEach(([key, value], index: number) => {
      if (index === 0) {
        query = query.where(key, value);
        return;
      }
      query = query.orWhere(key, value);
      return;
    });

    const result = await query;

    if (!result.length) {
      return;
    }

    return result;
  }

  private async sendUpdateByIdAndTenantIdQuery(
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId'],
    dto: IUpdateTenantAccountAllowedDtos
  ): Promise<number> {
    return this.dbClient(this.tableName).where({ id, tenantId }).update(dto);
  }

  private async sendDeleteByIdQuery(id: ITenantAccount['id']): Promise<number> {
    return await this.dbClient(this.tableName).where('id', id).del();
  }

  private async sendDeleteByIdAndTenantIdQuery(
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId']
  ): Promise<number> {
    return await this.dbClient(this.tableName).where({ id, tenantId }).del();
  }

  private async sendGetAccountsByRoleAndTenantIdQuery(
    tenantId: ITenantAccount['tenantId'],
    role: ITenantAccountRole
  ): Promise<IGetTenantAccountDto[]> {
    return this.dbClient<IGetTenantAccountDto>(this.tableName)
      .whereRaw(`roles @> ?`, [JSON.stringify(role)])
      .andWhere({ tenantId })
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
}

export { TenantAccountRepository };
