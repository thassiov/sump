import { Knex } from 'knex';
import {
  ICreateEnvironmentAccountNoInternalPropertiesDto,
  IGetEnvironmentAccountDto,
  IUpdateEnvironmentAccountEmailDto,
  IUpdateEnvironmentAccountNonSensitivePropertiesDto,
  IUpdateEnvironmentAccountPhoneDto,
  IUpdateEnvironmentAccountUsernameDto,
} from './dto.type';
import { IEnvironmentAccount } from './environment-account.type';

export type IEnvironmentAccountService = {
  create: (
    environmentId: IEnvironmentAccount['environmentId'],
    dto: ICreateEnvironmentAccountNoInternalPropertiesDto,
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
    dto: IUpdateEnvironmentAccountEmailDto
  ) => Promise<boolean>;
  updateUsernameByIdAndTenantEnvironmentId: (
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateEnvironmentAccountUsernameDto
  ) => Promise<boolean>;
  updatePhoneByIdAndTenantEnvironmentId: (
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateEnvironmentAccountPhoneDto
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
