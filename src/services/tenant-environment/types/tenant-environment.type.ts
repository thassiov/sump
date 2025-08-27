import z from 'zod';

const tenantEnvironmentSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  tenantId: z.uuid(),
  customProperties: z.record(z.string(), z.object()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type ITenantEnvironment = z.infer<typeof tenantEnvironmentSchema>;

export { tenantEnvironmentSchema };
export type { ITenantEnvironment };
