import z from 'zod';

const profileSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().date(),
  updatedAt: z.string().date(),
  fullName: z.string().max(100),
});

type IProfile = z.infer<typeof profileSchema>;

export { profileSchema };
export type { IProfile };
