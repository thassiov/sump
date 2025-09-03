import { Knex } from 'knex';
import {
  ICreateTenantEnvironmentDto,
  IGetTenantEnvironmentDto,
  IUpdateTenantEnvironmentAllowedDtos,
} from './dto.type';
import { ITenantEnvironment } from './tenant-environment.type';

type ITenantEnvironmentRepository = {
  create: (
    dto: ICreateTenantEnvironmentDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById(
    id: ITenantEnvironment['id']
  ): Promise<IGetTenantEnvironmentDto | undefined>;
  deleteById(id: ITenantEnvironment['id']): Promise<boolean>;
  updateById(
    id: ITenantEnvironment['id'],
    dto: IUpdateTenantEnvironmentAllowedDtos
  ): Promise<boolean>;

  setCustomPropertyById(
    id: ITenantEnvironment['id'],
    customProperty: ITenantEnvironment['customProperties']
  ): Promise<boolean>;

  deleteCustomPropertyById(
    id: ITenantEnvironment['id'],
    customPropertyKey: string
  ): Promise<boolean>;
};

export type { ITenantEnvironmentRepository };
