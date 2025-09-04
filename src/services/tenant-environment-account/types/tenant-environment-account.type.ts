import z from 'zod';

const tenantEnvironmentAccountSchema = z.object({
  id: z.uuid(),
  email: z.string().check(z.email()),
  emailVerified: z.boolean(),
  phone: z.string().check(z.e164()),
  phoneVerified: z.boolean(),
  name: z.string().min(3).max(100),
  username: z.string().min(3).max(20),
  avatarUrl: z.string().check(z.url()),
  tenantEnvironmentId: z.uuid(),
  customProperties: z.record(z.string(), z.json()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type ITenantEnvironmentAccount = z.infer<typeof tenantEnvironmentAccountSchema>;

export { tenantEnvironmentAccountSchema };
export type { ITenantEnvironmentAccount };
