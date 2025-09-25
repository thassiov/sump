import z from 'zod';

const accountRoleListSchema = z.enum(['owner', 'admin', 'user']);
const accountRoleTargetListSchema = z.enum(['tenant', 'environment']);
const accountRoleSchema = z.object({
  role: accountRoleListSchema,
  target: accountRoleTargetListSchema,
  targetId: z.uuid(),
});

const accountSchema = z.object({
  id: z.uuid(),
  email: z.string().check(z.email()),
  emailVerified: z.boolean().default(false),
  phone: z.string().check(z.e164()).optional(),
  phoneVerified: z.boolean().default(false),
  name: z.string().min(3).max(100),
  username: z.string().min(3).max(20),
  avatarUrl: z.string().check(z.url()).optional(),
  tenantId: z.uuid(),
  roles: z.array(accountRoleSchema).min(1).max(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type IAccount = z.infer<typeof accountSchema>;
type IAccountRole = z.infer<typeof accountRoleSchema>;

export { accountRoleSchema, accountSchema };
export type { IAccount, IAccountRole };
