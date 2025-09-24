import { Knex } from 'knex';
import { ITenantEnvironment } from '../../tenant-environment/types/tenant-environment.type';
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
    tenantEnvironmentId: ITenantEnvironment['id'],
    dto: ICreateTenantEnvironmentAccountNoInternalPropertiesDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById: (
    id: ITenantEnvironmentAccount['id']
  ) => Promise<IGetTenantEnvironmentAccountDto | undefined>;
  deleteById: (id: ITenantEnvironmentAccount['id']) => Promise<boolean>;
  updateNonSensitivePropertiesById: (
    id: ITenantEnvironmentAccount['id'],
    dto: IUpdateTenantEnvironmentAccountNonSensitivePropertiesDto
  ) => Promise<boolean>;
  updateEmailById: (
    id: ITenantEnvironmentAccount['id'],
    dto: IUpdateTenantEnvironmentAccountEmailDto
  ) => Promise<boolean>;
  updateUsernameById: (
    id: ITenantEnvironmentAccount['id'],
    dto: IUpdateTenantEnvironmentAccountUsernameDto
  ) => Promise<boolean>;
  updatePhoneById: (
    id: ITenantEnvironmentAccount['id'],
    dto: IUpdateTenantEnvironmentAccountPhoneDto
  ) => Promise<boolean>;
  setCustomPropertyById: (
    id: ITenantEnvironmentAccount['id'],
    customProperty: ITenantEnvironmentAccount['customProperties']
  ) => Promise<boolean>;
  deleteCustomPropertyById: (
    id: ITenantEnvironmentAccount['id'],
    customPropertyKey: string
  ) => Promise<boolean>;
};
