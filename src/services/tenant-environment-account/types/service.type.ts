import { Knex } from 'knex';
import {
  ICreateTenantEnvironmentAccountDto,
  IUpdateTenantEnvironmentAccountDto,
} from './dto.type';
import { ITenantEnvironmentAccount } from './tenant-environment-account.type';

export type ITenantEnvironmentAccountService = {
  create: (
    dto: ICreateTenantEnvironmentAccountDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById: (id: string) => Promise<ITenantEnvironmentAccount | undefined>;
  deleteById: (id: string) => Promise<boolean>;
  updateById: (
    id: string,
    dto: IUpdateTenantEnvironmentAccountDto
  ) => Promise<boolean>;
};
