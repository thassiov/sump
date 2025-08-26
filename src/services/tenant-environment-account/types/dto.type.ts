import z from 'zod';
import { tenantEnvironmentAccountSchema } from './tenant-environment-account.type';

const idSchema = z.string().uuid();

const createTenantEnvironmentAccountDtoSchema =
  tenantEnvironmentAccountSchema.pick({
    email: true,
    fullName: true,
  });
type ICreateTenantEnvironmentAccountDto = z.infer<
  typeof createTenantEnvironmentAccountDtoSchema
>;

const updateTenantEnvironmentAccountDtoSchema =
  createTenantEnvironmentAccountDtoSchema.partial();
type IUpdateTenantEnvironmentAccountDto = z.infer<
  typeof updateTenantEnvironmentAccountDtoSchema
>;

export type {
  ICreateTenantEnvironmentAccountDto,
  IUpdateTenantEnvironmentAccountDto,
};

export {
  createTenantEnvironmentAccountDtoSchema,
  idSchema,
  updateTenantEnvironmentAccountDtoSchema,
};
