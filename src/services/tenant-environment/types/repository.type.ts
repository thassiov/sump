import { Knex } from 'knex';
import {
  ICreateTenantEnvironmentDto,
  IUpdateTenantEnvironmentDto,
} from './dto.type';
import { ITenantEnvironment } from './tenant-environment.type';

type ITenantEnvironmentRepository = {
  create: (
    dto: ICreateTenantEnvironmentDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById(id: string): Promise<ITenantEnvironment | undefined>;
  deleteById(id: string): Promise<boolean>;
  updateById(id: string, dto: IUpdateTenantEnvironmentDto): Promise<boolean>;
};

export type { ITenantEnvironmentRepository };
