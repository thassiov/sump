import z from 'zod';
import { tenantSchema } from './tenant.type';

const idSchema = z.string().uuid();

const createTenantDtoSchema = tenantSchema.pick({
  name: true,
  ownerId: true,
});
type ICreateTenantDto = z.infer<typeof createTenantDtoSchema>;

const updateTenantDtoSchema = createTenantDtoSchema.partial();
type IUpdateTenantDto = z.infer<typeof updateTenantDtoSchema>;

export type { ICreateTenantDto, IUpdateTenantDto };

export { createTenantDtoSchema, idSchema, updateTenantDtoSchema };
