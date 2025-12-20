import { Knex } from 'knex';
import {
  ICreateTenantEnvironmentAccountDto,
  IGetTenantEnvironmentAccountDto,
  IUpdateTenantEnvironmentAccountAllowedDtos,
} from './dto.type';
import { ITenantEnvironmentAccount } from './tenant-environment-account.type';

type ITenantEnvironmentAccountRepository = {
  create: (
    dto: ICreateTenantEnvironmentAccountDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById(
    id: ITenantEnvironmentAccount['id']
  ): Promise<IGetTenantEnvironmentAccountDto | undefined>;
  getByIdAndTenantEnvironmentId: (
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId']
  ) => Promise<IGetTenantEnvironmentAccountDto | undefined>;
  deleteById(id: ITenantEnvironmentAccount['id']): Promise<boolean>;
  deleteByIdAndTenantEnvironmentId: (
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId']
  ) => Promise<boolean>;
  updateByIdAndTenantEnvironmentId(
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: IUpdateTenantEnvironmentAccountAllowedDtos
  ): Promise<boolean>;
  setCustomPropertyByIdAndTenantEnvironmentId: (
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    customProperty: ITenantEnvironmentAccount['customProperties']
  ) => Promise<boolean>;
  deleteCustomPropertyByIdAndTenantEnvironmentId: (
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    customPropertyKey: string
  ) => Promise<boolean>;
};

export type { ITenantEnvironmentAccountRepository };
