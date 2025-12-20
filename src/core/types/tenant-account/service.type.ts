import { Knex } from 'knex';
import { ITenantAccount } from './tenant-account.type';
import {
  ITenantAccountUserDefinedIdentification,
  ICreateTenantAccountDto,
  IGetTenantAccountDto,
  IUpdateTenantAccountEmailDto,
  IUpdateTenantAccountNonSensitivePropertiesDto,
  IUpdateTenantAccountPhoneDto,
  IUpdateTenantAccountUsernameDto,
} from './dto.type';

export type ITenantAccountService = {
  create: (
    tenantId: ITenantAccount['tenantId'],
    dto: ICreateTenantAccountDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById: (id: ITenantAccount['id']) => Promise<IGetTenantAccountDto | undefined>;
  getByTenantId: (
    tenantId: ITenantAccount['tenantId']
  ) => Promise<IGetTenantAccountDto[] | undefined>;
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
  deleteById: (id: ITenantAccount['id']) => Promise<boolean>;
  deleteByIdAndTenantId: (
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId']
  ) => Promise<boolean>;
  updateNonSensitivePropertiesByIdAndTenantId: (
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId'],
    dto: IUpdateTenantAccountNonSensitivePropertiesDto
  ) => Promise<boolean>;
  updateEmailByIdAndTenantId: (
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId'],
    dto: IUpdateTenantAccountEmailDto
  ) => Promise<boolean>;
  updateUsernameByIdAndTenantId: (
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId'],
    dto: IUpdateTenantAccountUsernameDto
  ) => Promise<boolean>;
  updatePhoneByIdAndTenantId: (
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId'],
    dto: IUpdateTenantAccountPhoneDto
  ) => Promise<boolean>;
  canAccountBeDeleted(
    id: ITenantAccount['id'],
    tenantId: ITenantAccount['tenantId']
  ): Promise<boolean>;
};
