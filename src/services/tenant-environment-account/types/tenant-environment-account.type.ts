import z from 'zod';

const tenantEnvironmentAccountSchema = z.object({
  id: z.uuid(),
  email: z.string().check(z.email()),
  emailVerified: z.boolean(),
  phone: z.string().check(z.e164()),
  phoneVerified: z.boolean(),
  name: z.string().max(100),
  username: z.string().max(20),
  avatarUrl: z.string().check(z.url()),
  tenantEnvironmentId: z.uuid(), // @NOTE: not certain about this property name...
  customProperties: z.record(
    z.string(),
    z.object().refine(() => ({}))
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type ITenantEnvironmentAccount = z.infer<typeof tenantEnvironmentAccountSchema>;

export { tenantEnvironmentAccountSchema };
export type { ITenantEnvironmentAccount };
