import { Knex } from 'knex';
import {
  ICreateTenantEnvironmentAccountNoInternalPropertiesDto,
  IGetEnvironmentAccountDto,
  IUpdateTenantEnvironmentAccountEmailDto,
  IUpdateEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateTenantEnvironmentAccountPhoneDto,
  IUpdateTenantEnvironmentAccountUsernameDto,
} from './dto.type';
import { IEnvironmentAccount } from './environment-account.type';

export type IEnvironmentAccountService = {
  create: (
    environmentId: IEnvironmentAccount['environmentId'],
    dto: ICreateTenantEnvironmentAccountNoInternalPropertiesDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById: (
    id: IEnvironmentAccount['id']
  ) => Promise<IGetEnvironmentAccountDto | undefined>;
  getByIdAndTenantEnvironmentId: (
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ) => Promise<IGetEnvironmentAccountDto | undefined>;
  deleteById: (id: IEnvironmentAccount['id']) => Promise<boolean>;
  deleteByIdAndTenantEnvironmentId: (
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ) => Promise<boolean>;
  updateNonSensitivePropertiesByIdAndTenantEnvironmentId: (
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateEnvironmentAccountNonSensitivePropertiesDto
  ) => Promise<boolean>;
  updateEmailByIdAndTenantEnvironmentId: (
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateTenantEnvironmentAccountEmailDto
  ) => Promise<boolean>;
  updateUsernameByIdAndTenantEnvironmentId: (
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateTenantEnvironmentAccountUsernameDto
  ) => Promise<boolean>;
  updatePhoneByIdAndTenantEnvironmentId: (
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateTenantEnvironmentAccountPhoneDto
  ) => Promise<boolean>;
  setCustomPropertyByIdAndTenantEnvironmentId: (
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    customProperty: IEnvironmentAccount['customProperties']
  ) => Promise<boolean>;
  deleteCustomPropertyByIdAndTenantEnvironmentId: (
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    customPropertyKey: string
  ) => Promise<boolean>;
  disableByIdAndEnvironmentId: (
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ) => Promise<boolean>;
  enableByIdAndEnvironmentId: (
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ) => Promise<boolean>;
};
