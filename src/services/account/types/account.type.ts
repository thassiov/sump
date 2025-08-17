import z from 'zod';

const accountSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().date(),
  updatedAt: z.string().date(),
  email: z.string().email(),
  fullName: z.string().max(100),
});

type IAccount = z.infer<typeof accountSchema>;

export { accountSchema };
export type { IAccount };
