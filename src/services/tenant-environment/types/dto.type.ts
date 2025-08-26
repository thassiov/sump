import z from 'zod';
import { tenantEnvironmentSchema } from './tenant-environment.type';

const idSchema = z.string().uuid();

const createTenantEnvironmentDtoSchema = tenantEnvironmentSchema.pick({
  name: true,
  ownerId: true,
});
type ICreateTenantEnvironmentDto = z.infer<
  typeof createTenantEnvironmentDtoSchema
>;

const updateTenantEnvironmentDtoSchema =
  createTenantEnvironmentDtoSchema.partial();
type IUpdateTenantEnvironmentDto = z.infer<
  typeof updateTenantEnvironmentDtoSchema
>;

export type { ICreateTenantEnvironmentDto, IUpdateTenantEnvironmentDto };

export {
  createTenantEnvironmentDtoSchema,
  idSchema,
  updateTenantEnvironmentDtoSchema,
};
