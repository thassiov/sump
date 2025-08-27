import z from 'zod';

const tenantSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  customProperties: z.record(z.string(), z.object()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type ITenant = z.infer<typeof tenantSchema>;

export { tenantSchema };
export type { ITenant };
