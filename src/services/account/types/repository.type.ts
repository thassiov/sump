import { Knex } from 'knex';
import { IAccount } from './account.type';
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
  getByUserDefinedIdentification: (
    accountUserDefinedIdentification: IAccountUserDefinedIdentification
  ) => Promise<IGetAccountDto[] | undefined>;
  deleteById(id: IAccount['id']): Promise<boolean>;
  updateById(
    id: IAccount['id'],
    dto: IUpdateAccountAllowedDtos
  ): Promise<boolean>;
};

export type { IAccountRepository };
