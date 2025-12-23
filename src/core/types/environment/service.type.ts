import { Knex } from 'knex';
import {
  ICreateEnvironmentNoInternalPropertiesDto,
  IGetEnvironmentDto,
  IUpdateEnvironmentNonSensitivePropertiesDto,
} from './dto.type';
import { IEnvironment } from './environment.type';

export type IEnvironmentService = {
  create: (
    tenantId: IEnvironment['tenantId'],
    dto: ICreateEnvironmentNoInternalPropertiesDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById: (
    id: IEnvironment['id']
  ) => Promise<IGetEnvironmentDto | undefined>;
  getByIdAndTenantId: (
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId']
  ) => Promise<IGetEnvironmentDto | undefined>;
  getByTenantId: (
    tenantId: IEnvironment['tenantId']
  ) => Promise<IGetEnvironmentDto[] | undefined>;
  deleteById: (id: IEnvironment['id']) => Promise<boolean>;
  deleteByIdAndTenantId: (
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId']
  ) => Promise<boolean>;
  updateNonSensitivePropertiesByIdAndTenantId: (
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId'],
    dto: IUpdateEnvironmentNonSensitivePropertiesDto
  ) => Promise<boolean>;
  setCustomPropertyByIdAndTenantId: (
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId'],
    customProperty: IEnvironment['customProperties']
  ) => Promise<boolean>;
  deleteCustomPropertyByIdAndTenantId: (
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId'],
    customPropertyKey: string
  ) => Promise<boolean>;
};
