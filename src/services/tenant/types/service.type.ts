import { Knex } from 'knex';
import {
  ICreateTenantDto,
  IGetTenantDto,
  IUpdateTenantNonSensitivePropertiesDto,
} from './dto.type';
import { ITenant } from './tenant.type';

export type ITenantService = {
  create: (
    dto: ICreateTenantDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById: (id: ITenant['id']) => Promise<IGetTenantDto | undefined>;
  deleteById: (id: ITenant['id']) => Promise<boolean>;
  updateNonSensitivePropertiesById: (
    id: ITenant['id'],
    dto: IUpdateTenantNonSensitivePropertiesDto
  ) => Promise<boolean>;
  setCustomPropertyById: (
    id: ITenant['id'],
    customProperty: ITenant['customProperties']
  ) => Promise<boolean>;
  deleteCustomPropertyById: (
    id: ITenant['id'],
    customPropertyKey: string
  ) => Promise<boolean>;
};
