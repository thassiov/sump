import z from 'zod';

const tenantEnvironmentSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  name: z.string(),
  createdAt: z.string().date(),
  updatedAt: z.string().date(),
});

type ITenantEnvironment = z.infer<typeof tenantEnvironmentSchema>;

export { tenantEnvironmentSchema };
export type { ITenantEnvironment };
