import z from 'zod';

const customPropertySchema = z.record(z.string(), z.json());

const tenantSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2),
  customProperties: customPropertySchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

type ITenant = z.infer<typeof tenantSchema>;

export { tenantSchema };
export type { ITenant };
