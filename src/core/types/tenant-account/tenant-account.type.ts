import z from 'zod';

const tenantAccountRoleListSchema = z.enum(['owner', 'admin', 'user']);
const tenantAccountRoleTargetListSchema = z.enum(['tenant', 'environment']);
const tenantAccountRoleSchema = z.object({
  role: tenantAccountRoleListSchema,
  target: tenantAccountRoleTargetListSchema,
  targetId: z.uuid(),
});

const tenantAccountSchema = z.object({
  id: z.uuid(),
  email: z.string().check(z.email()),
  emailVerified: z.boolean().default(false),
  phone: z.string().check(z.e164()).optional(),
  phoneVerified: z.boolean().default(false),
  name: z.string().min(3).max(100),
  username: z.string().min(3).max(20),
  avatarUrl: z.string().check(z.url()).optional(),
  tenantId: z.uuid(),
  roles: z.array(tenantAccountRoleSchema).min(1).max(1),
  disabled: z.boolean(),
  disabledAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type ITenantAccount = z.infer<typeof tenantAccountSchema>;
type ITenantAccountRole = z.infer<typeof tenantAccountRoleSchema>;
type ITenantAccountRoleType = z.infer<typeof tenantAccountRoleListSchema>;

export { tenantAccountRoleSchema, tenantAccountRoleListSchema, tenantAccountSchema };
export type { ITenantAccount, ITenantAccountRole, ITenantAccountRoleType };
