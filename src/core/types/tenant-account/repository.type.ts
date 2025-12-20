import { Knex } from 'knex';
import { ITenantAccount, ITenantAccountRole } from './tenant-account.type';
import {
  ITenantAccountUserDefinedIdentification,
  ICreateTenantAccountDto,
  IGetTenantAccountDto,
  IUpdateTenantAccountAllowedDtos,
} from './dto.type';

type ITenantAccountRepository = {
  create: (
    dto: ICreateTenantAccountDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById(id: ITenantAccount['id']): Promise<IGetTenantAccountDto | undefined>;
  getByTenantId(
    id: ITenantAccount['tenantId']
  ): Promise<IGetTenantAccountDto[] | undefined>;
  getByAccountIdAndTenantId: (
    accountId: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId']
  ) => Promise<IGetTenantAccountDto | undefined>;
  getByUserDefinedIdentificationAndTenantId: (
    accountUserDefinedIdentification: ITenantAccountUserDefinedIdentification,
    tenantId: ITenantAccount['tenantId']
  ) => Promise<IGetTenantAccountDto[] | undefined>;
  getByUserDefinedIdentification: (
    accountUserDefinedIdentification: ITenantAccountUserDefinedIdentification
  ) => Promise<IGetTenantAccountDto[] | undefined>;
  deleteById(id: ITenantAccount['id']): Promise<boolean>;
  deleteByIdAndTenantId: (
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId']
  ) => Promise<boolean>;
  updateByIdAndTenantId(
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId'],
    dto: IUpdateTenantAccountAllowedDtos
  ): Promise<boolean>;
  getAccountsByRoleAndByTenantId(
    tenantId: ITenantAccount['tenantId'],
    role: ITenantAccountRole
  ): Promise<IGetTenantAccountDto[]>;
};

export type { ITenantAccountRepository };
