import { Knex } from 'knex';
import { ITenant } from '../../tenant/types/tenant.type';
import { IAccount } from './account.type';
import {
  IAccountUserDefinedIdentification,
  ICreateAccountDto,
  IGetAccountDto,
  IUpdateAccountEmailDto,
  IUpdateAccountNonSensitivePropertiesDto,
  IUpdateAccountPhoneDto,
  IUpdateAccountUsernameDto,
} from './dto.type';

export type IAccountService = {
  create: (
    tenantId: ITenant['id'],
    dto: ICreateAccountDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById: (id: IAccount['id']) => Promise<IGetAccountDto | undefined>;
  getByTenantId: (
    tenantId: IAccount['tenantId']
  ) => Promise<IGetAccountDto[] | undefined>;
  getByAccountIdAndTenantId: (
    accountId: IAccount['id'],
    tenantId: IAccount['tenantId']
  ) => Promise<IGetAccountDto | undefined>;
  getByUserDefinedIdentification: (
    accountUserDefinedIdentification: IAccountUserDefinedIdentification
  ) => Promise<IGetAccountDto[] | undefined>;
  deleteById: (id: IAccount['id']) => Promise<boolean>;
  updateNonSensitivePropertiesById: (
    id: IAccount['id'],
    dto: IUpdateAccountNonSensitivePropertiesDto
  ) => Promise<boolean>;
  updateEmailById: (
    id: IAccount['id'],
    dto: IUpdateAccountEmailDto
  ) => Promise<boolean>;
  updateUsernameById: (
    id: IAccount['id'],
    dto: IUpdateAccountUsernameDto
  ) => Promise<boolean>;
  updatePhoneById: (
    id: IAccount['id'],
    dto: IUpdateAccountPhoneDto
  ) => Promise<boolean>;
};
