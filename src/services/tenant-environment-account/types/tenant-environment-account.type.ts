import z from 'zod';

const tenantEnvironmentAccountSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().date(),
  updatedAt: z.string().date(),
  email: z.string().email(),
  fullName: z.string().max(100),
});

type ITenantEnvironmentAccount = z.infer<typeof tenantEnvironmentAccountSchema>;

export { tenantEnvironmentAccountSchema };
export type { ITenantEnvironmentAccount };
