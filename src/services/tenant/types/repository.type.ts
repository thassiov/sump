import { Knex } from 'knex';
import {
  ICreateTenantDto,
  IGetTenantDto,
  IUpdateTenantAllowedDtos,
} from './dto.type';
import { ITenant } from './tenant.type';

type ITenantRepository = {
  create: (
    dto: ICreateTenantDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById(id: ITenant['id']): Promise<IGetTenantDto | undefined>;
  deleteById(id: ITenant['id']): Promise<boolean>;
  updateById(
    id: ITenant['id'],
    dto: IUpdateTenantAllowedDtos
  ): Promise<boolean>;

  setCustomPropertyById(
    id: ITenant['id'],
    customProperty: ITenant['customProperties']
  ): Promise<boolean>;

  deleteCustomPropertyById(
    id: ITenant['id'],
    customPropertyKey: string
  ): Promise<boolean>;
};

export type { ITenantRepository };
