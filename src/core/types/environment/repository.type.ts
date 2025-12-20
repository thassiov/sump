import { Knex } from 'knex';
import {
  ICreateEnvironmentDto,
  IGetEnvironmentDto,
  IUpdateEnvironmentAllowedDtos,
} from './dto.type';
import { IEnvironment } from './environment.type';

type IEnvironmentRepository = {
  create: (
    dto: ICreateEnvironmentDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById(
    id: IEnvironment['id']
  ): Promise<IGetEnvironmentDto | undefined>;
  getByIdAndTenantId(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId']
  ): Promise<IGetEnvironmentDto | undefined>;
  getByTenantId(
    tenantId: IEnvironment['tenantId']
  ): Promise<IGetEnvironmentDto[] | undefined>;
  deleteById(id: IEnvironment['id']): Promise<boolean>;
  deleteByIdAndTenantId: (
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId']
  ) => Promise<boolean>;
  updateByIdAndTenantId(
    id: IEnvironment['id'],
    tenantId: IEnvironment['tenantId'],
    dto: IUpdateEnvironmentAllowedDtos
  ): Promise<boolean>;
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

export type { IEnvironmentRepository };
