import { Knex } from 'knex';
import {
  ICreateTenantEnvironmentNoInternalPropertiesDto,
  IGetTenantEnvironmentDto,
  IUpdateTenantEnvironmentNonSensitivePropertiesDto,
} from './dto.type';
import { ITenantEnvironment } from './tenant-environment.type';

export type ITenantEnvironmentService = {
  create: (
    tenantId: ITenantEnvironment['tenantId'],
    dto: ICreateTenantEnvironmentNoInternalPropertiesDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById: (
    id: ITenantEnvironment['id']
  ) => Promise<IGetTenantEnvironmentDto | undefined>;
  getByIdAndTenantId: (
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId']
  ) => Promise<IGetTenantEnvironmentDto | undefined>;
  getByTenantId: (
    tenantId: ITenantEnvironment['tenantId']
  ) => Promise<IGetTenantEnvironmentDto[] | undefined>;
  deleteById: (id: ITenantEnvironment['id']) => Promise<boolean>;
  deleteByIdAndTenantId: (
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId']
  ) => Promise<boolean>;
  updateNonSensitivePropertiesByIdAndTenantId: (
    id: ITenantEnvironment['id'],
    tenantId: ITenantEnvironment['tenantId'],
    dto: IUpdateTenantEnvironmentNonSensitivePropertiesDto
  ) => Promise<boolean>;
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
