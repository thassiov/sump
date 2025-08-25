import z from 'zod';

const tenantSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  name: z.string(),
  createdAt: z.string().date(),
  updatedAt: z.string().date(),
});

type ITenant = z.infer<typeof tenantSchema>;

export { tenantSchema };
export type { ITenant };
