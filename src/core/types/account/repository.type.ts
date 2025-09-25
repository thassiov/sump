import { Knex } from 'knex';
import { IAccount } from './account.type';
import {
  IAccountOptionalQueryFilters,
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
  getByUserDefinedIdentification: (
    accountUserDefinedIdentification: IAccountUserDefinedIdentification
  ) => Promise<IGetAccountDto[] | undefined>;
  deleteById(id: IAccount['id']): Promise<boolean>;
  deleteByIdAndTenantId: (
    id: IAccount['id'],
    tenantId: IAccount['tenantId']
  ) => Promise<boolean>;
  updateById(
    id: IAccount['id'],
    dto: IUpdateAccountAllowedDtos,
    optionalQueryFilters?: IAccountOptionalQueryFilters
  ): Promise<boolean>;
};

export type { IAccountRepository };
