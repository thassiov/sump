import { Knex } from 'knex';
import {
  ICreateTenantEnvironmentAccountNoInternalPropertiesDto,
  IGetTenantEnvironmentAccountDto,
  IUpdateTenantEnvironmentAccountEmailDto,
  IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateTenantEnvironmentAccountPhoneDto,
  IUpdateTenantEnvironmentAccountUsernameDto,
} from './dto.type';
import { ITenantEnvironmentAccount } from './tenant-environment-account.type';

export type ITenantEnvironmentAccountService = {
  create: (
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: ICreateTenantEnvironmentAccountNoInternalPropertiesDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById: (
    id: ITenantEnvironmentAccount['id']
  ) => Promise<IGetTenantEnvironmentAccountDto | undefined>;
  getByIdAndTenantEnvironmentId: (
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId']
  ) => Promise<IGetTenantEnvironmentAccountDto | undefined>;
  deleteById: (id: ITenantEnvironmentAccount['id']) => Promise<boolean>;
  deleteByIdAndTenantEnvironmentId: (
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId']
  ) => Promise<boolean>;
  updateNonSensitivePropertiesByIdAndTenantEnvironmentId: (
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto
  ) => Promise<boolean>;
  updateEmailByIdAndTenantEnvironmentId: (
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: IUpdateTenantEnvironmentAccountEmailDto
  ) => Promise<boolean>;
  updateUsernameByIdAndTenantEnvironmentId: (
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: IUpdateTenantEnvironmentAccountUsernameDto
  ) => Promise<boolean>;
  updatePhoneByIdAndTenantEnvironmentId: (
    id: ITenantEnvironmentAccount['id'],
    tenantEnvironmentId: ITenantEnvironmentAccount['tenantEnvironmentId'],
    dto: IUpdateTenantEnvironmentAccountPhoneDto
  ) => Promise<boolean>;
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
