import z from 'zod';

const environmentAccountSchema = z.object({
  id: z.uuid(),
  email: z.string().check(z.email()),
  emailVerified: z.boolean(),
  phone: z.string().check(z.e164()),
  phoneVerified: z.boolean(),
  name: z.string().min(3).max(100),
  username: z.string().min(3).max(20),
  avatarUrl: z.string().check(z.url()),
  environmentId: z.uuid(),
  customProperties: z.record(z.string(), z.json()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type IEnvironmentAccount = z.infer<typeof environmentAccountSchema>;

export { environmentAccountSchema };
export type { IEnvironmentAccount };
