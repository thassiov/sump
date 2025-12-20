import { Knex } from 'knex';
import {
  ICreateEnvironmentAccountDto,
  IGetEnvironmentAccountDto,
  IUpdateEnvironmentAccountAllowedDtos,
} from './dto.type';
import { IEnvironmentAccount } from './environment-account.type';

type IEnvironmentAccountRepository = {
  create: (
    dto: ICreateEnvironmentAccountDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById(
    id: IEnvironmentAccount['id']
  ): Promise<IGetEnvironmentAccountDto | undefined>;
  getByIdAndTenantEnvironmentId: (
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ) => Promise<IGetEnvironmentAccountDto | undefined>;
  deleteById(id: IEnvironmentAccount['id']): Promise<boolean>;
  deleteByIdAndTenantEnvironmentId: (
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId']
  ) => Promise<boolean>;
  updateByIdAndTenantEnvironmentId(
    id: IEnvironmentAccount['id'],
    environmentId: IEnvironmentAccount['environmentId'],
    dto: IUpdateEnvironmentAccountAllowedDtos
  ): Promise<boolean>;
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
};

export type { IEnvironmentAccountRepository };
