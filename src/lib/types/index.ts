import z from 'zod';

const uuidv4Schema = z.string().uuid();

const externalServiceSchema = z.object({
  url: z.string(),
});

const externalServicesRecordSchema = z.object({
  account: externalServiceSchema.optional(),
});

const databaseConfigSchema = z.object({
  host: z.string(),
  port: z.string(),
  user: z.string(),
  database: z.string(),
  password: z.string(),
});

const sumpConfigSchema = z.object({
  service: z.enum(['main', 'account']),
  externalServices: externalServicesRecordSchema.optional(),
  database: databaseConfigSchema,
});

type SumpConfig = z.infer<typeof sumpConfigSchema>;
type DatabaseConfig = z.infer<typeof databaseConfigSchema>;

export { sumpConfigSchema, uuidv4Schema };

export type { DatabaseConfig, SumpConfig };
