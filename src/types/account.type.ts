import z from 'zod';

const accountSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().date(),
  updatedAt: z.string().date(),
  username: z.string().min(3).max(20),
  email: z.string().email(),
});

type IAccount = z.infer<typeof accountSchema>;

export { accountSchema };
export type { IAccount };
