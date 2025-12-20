import z from 'zod';

const customPropertySchema = z.record(z.string(), z.json());

const environmentSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2),
  tenantId: z.uuid(),
  customProperties: customPropertySchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

type IEnvironment = z.infer<typeof environmentSchema>;

export { environmentSchema };
export type { IEnvironment };
