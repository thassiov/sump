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
  getByIdAndTenantId(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId']
  ): Promise<IGetTenantEnvironmentDto | undefined>;
  getByTenantId(
    tenantId: ITenantEnvironment['tenantId']
  ): Promise<IGetTenantEnvironmentDto[] | undefined>;
  deleteById(id: ITenantEnvironment['id']): Promise<boolean>;
  deleteByIdAndTenantId: (
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId']
  ) => Promise<boolean>;
  updateByIdAndTenantId(
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId'],
    dto: IUpdateTenantEnvironmentAllowedDtos
  ): Promise<boolean>;
  setCustomPropertyByIdAndTenantId: (
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId'],
    customProperty: ITenantEnvironment['customProperties']
  ) => Promise<boolean>;
  deleteCustomPropertyByIdAndTenantId: (
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId'],
    customPropertyKey: string
  ) => Promise<boolean>;
};

export type { ITenantEnvironmentRepository };
