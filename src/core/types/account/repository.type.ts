import { Knex } from 'knex';
import { IAccount, IAccountRole } from './account.type';
import {
  IAccountUserDefinedIdentification,
  ICreateAccountDto,
  IGetAccountDto,
  IUpdateAccountAllowedDtos,
} from './dto.type';

type IAccountRepository = {
  create: (
    dto: ICreateAccountDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById(id: IAccount['id']): Promise<IGetAccountDto | undefined>;
  getByTenantId(
    id: IAccount['tenantId']
  ): Promise<IGetAccountDto[] | undefined>;
  getByAccountIdAndTenantId: (
    accountId: IAccount['id'],
    tenantId: IAccount['tenantId']
  ) => Promise<IGetAccountDto | undefined>;
  getByUserDefinedIdentificationAndTenantId: (
    accountUserDefinedIdentification: IAccountUserDefinedIdentification,
    tenantId: IAccount['tenantId']
  ) => Promise<IGetAccountDto[] | undefined>;
  getByUserDefinedIdentification: (
    accountUserDefinedIdentification: IAccountUserDefinedIdentification
  ) => Promise<IGetAccountDto[] | undefined>;
  deleteById(id: IAccount['id']): Promise<boolean>;
  deleteByIdAndTenantId: (
    id: IAccount['id'],
    tenantId: IAccount['tenantId']
  ) => Promise<boolean>;
  updateByIdAndTenantId(
    id: IAccount['id'],
    tenantId: IAccount['tenantId'],
    dto: IUpdateAccountAllowedDtos
  ): Promise<boolean>;
  getAccountsByRoleAndByTenantId(
    tenantId: IAccount['tenantId'],
    role: IAccountRole
  ): Promise<IGetAccountDto[]>;
};

export type { IAccountRepository };
