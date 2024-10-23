import z from 'zod';

const accountSchema = z.object({
  id: z.string().uuid(),
  handle: z.string(),
  profileId: z.string().uuid(),
  createdAt: z.string().date(),
});

const profileSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().date(),
  fullName: z.string().max(100),
});

type IAccount = z.infer<typeof accountSchema>;

type IProfile = z.infer<typeof profileSchema>;

export { accountSchema, profileSchema };
export type { IAccount, IProfile };
