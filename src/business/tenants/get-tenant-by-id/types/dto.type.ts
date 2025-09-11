import z from 'zod';
import { tenantEnvironmentSchema } from '../../../../services/tenant-environment/types/tenant-environment.type';
import { tenantSchema } from '../../../../services/tenant/types/tenant.type';

const tenantEnvironmentListSchema = z.array(
  z.strictObject(tenantEnvironmentSchema.shape).pick({
    id: true,
    name: true,
    tenantId: true,
    customProperties: true,
  })
);

const getTenantByIdUseCaseResultDtoSchema = z
  .strictObject(tenantSchema.shape)
  .pick({
    id: true,
    name: true,
    customProperties: true,
  })
  .extend({
    environments: tenantEnvironmentListSchema,
  });

type GetTenantByIdUseCaseResultDto = z.infer<
  typeof getTenantByIdUseCaseResultDtoSchema
>;

export { getTenantByIdUseCaseResultDtoSchema };
export type { GetTenantByIdUseCaseResultDto };
