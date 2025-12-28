import z from 'zod';

const accountTypeSchema = z.enum(['tenant_account', 'environment_account']);
const contextTypeSchema = z.enum(['tenant', 'environment']);

const sessionSchema = z.object({
  id: z.uuid(),
  token: z.string().length(64),
  accountType: accountTypeSchema,
  accountId: z.uuid(),
  contextType: contextTypeSchema,
  contextId: z.uuid(),
  expiresAt: z.date(),
  ipAddress: z.string().max(45).nullable().optional(),
  userAgent: z.string().nullable().optional(),
  lastActiveAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const createSessionSchema = z.object({
  accountType: accountTypeSchema,
  accountId: z.uuid(),
  contextType: contextTypeSchema,
  contextId: z.uuid(),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().optional(),
});

type ISession = z.infer<typeof sessionSchema>;
type ICreateSession = z.infer<typeof createSessionSchema>;
type AccountType = z.infer<typeof accountTypeSchema>;
type ContextType = z.infer<typeof contextTypeSchema>;

export {
  accountTypeSchema,
  contextTypeSchema,
  createSessionSchema,
  sessionSchema,
};
export type { AccountType, ContextType, ICreateSession, ISession };
