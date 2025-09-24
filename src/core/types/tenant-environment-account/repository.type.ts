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
  deleteById(id: ITenantEnvironmentAccount['id']): Promise<boolean>;
  updateById(
    id: ITenantEnvironmentAccount['id'],
    dto: IUpdateTenantEnvironmentAccountAllowedDtos
  ): Promise<boolean>;

  setCustomPropertyById(
    id: ITenantEnvironmentAccount['id'],
    customProperty: ITenantEnvironmentAccount['customProperties']
  ): Promise<boolean>;

  deleteCustomPropertyById(
    id: ITenantEnvironmentAccount['id'],
    customPropertyKey: string
  ): Promise<boolean>;
};

export type { ITenantEnvironmentAccountRepository };
