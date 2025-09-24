import z from 'zod';

const customPropertySchema = z.record(z.string(), z.json());

const tenantEnvironmentSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2),
  tenantId: z.uuid(),
  customProperties: customPropertySchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

type ITenantEnvironment = z.infer<typeof tenantEnvironmentSchema>;

export { tenantEnvironmentSchema };
export type { ITenantEnvironment };
