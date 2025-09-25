import { Knex } from 'knex';
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
    tenantId: IAccount['tenantId'],
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
  getByUserDefinedIdentificationAndTenantId: (
    accountUserDefinedIdentification: IAccountUserDefinedIdentification,
    tenantId: IAccount['tenantId']
  ) => Promise<IGetAccountDto[] | undefined>;
  deleteById: (id: IAccount['id']) => Promise<boolean>;
  deleteByIdAndTenantId: (
    id: IAccount['id'],
    tenantId: IAccount['tenantId']
  ) => Promise<boolean>;
  updateNonSensitivePropertiesByIdAndTenantId: (
    id: IAccount['id'],
    tenantId: IAccount['tenantId'],
    dto: IUpdateAccountNonSensitivePropertiesDto
  ) => Promise<boolean>;
  updateEmailByIdAndTenantId: (
    id: IAccount['id'],
    tenantId: IAccount['tenantId'],
    dto: IUpdateAccountEmailDto
  ) => Promise<boolean>;
  updateUsernameByIdAndTenantId: (
    id: IAccount['id'],
    tenantId: IAccount['tenantId'],
    dto: IUpdateAccountUsernameDto
  ) => Promise<boolean>;
  updatePhoneByIdAndTenantId: (
    id: IAccount['id'],
    tenantId: IAccount['tenantId'],
    dto: IUpdateAccountPhoneDto
  ) => Promise<boolean>;
};
