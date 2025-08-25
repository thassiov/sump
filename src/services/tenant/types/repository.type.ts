import { Knex } from 'knex';
import { ICreateTenantDto, IUpdateTenantDto } from './dto.type';
import { ITenant } from './tenant.type';

type ITenantRepository = {
  create: (
    createTenantDto: ICreateTenantDto,
    transaction?: Knex.Transaction
  ) => Promise<string>;
  getTenantById(tenantId: string): Promise<ITenant | undefined>;
  removeTenantById(tenantId: string): Promise<boolean>;
  updateTenantById(
    tenantId: string,
    updateTenantDto: IUpdateTenantDto
  ): Promise<boolean>;
};

export type { ITenantRepository };
