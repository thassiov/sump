import { Knex } from 'knex';
import { ICreateTenantDto, IUpdateTenantDto } from './dto.type';
import { ITenant } from './tenant.type';

export type ITenantService = {
  create: (
    dto: ICreateTenantDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getById: (id: string) => Promise<ITenant | undefined>;
  deleteById: (id: string) => Promise<boolean>;
  updateById: (id: string, dto: IUpdateTenantDto) => Promise<boolean>;
};
