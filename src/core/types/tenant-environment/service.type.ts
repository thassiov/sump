import { Knex } from 'knex';
import { ITenant } from '../../tenant/types/tenant.type';
import {
  ICreateTenantEnvironmentNoInternalPropertiesDto,
  IGetTenantEnvironmentDto,
  IUpdateTenantEnvironmentNonSensitivePropertiesDto,
} from './dto.type';
import { ITenantEnvironment } from './tenant-environment.type';

export type ITenantEnvironmentService = {
  create: (
    tenantId: ITenant['id'],
    dto: ICreateTenantEnvironmentNoInternalPropertiesDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById: (
    id: ITenantEnvironment['id']
  ) => Promise<IGetTenantEnvironmentDto | undefined>;
  getByTenantId: (
    tenantId: ITenantEnvironment['tenantId']
  ) => Promise<IGetTenantEnvironmentDto[] | undefined>;
  deleteById: (id: ITenantEnvironment['id']) => Promise<boolean>;
  updateNonSensitivePropertiesById: (
    id: ITenantEnvironment['id'],
    dto: IUpdateTenantEnvironmentNonSensitivePropertiesDto
  ) => Promise<boolean>;
  setCustomPropertyById: (
    id: ITenantEnvironment['id'],
    customProperty: ITenantEnvironment['customProperties']
  ) => Promise<boolean>;
  deleteCustomPropertyById: (
    id: ITenantEnvironment['id'],
    customPropertyKey: string
  ) => Promise<boolean>;
};
