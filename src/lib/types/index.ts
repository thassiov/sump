import z from 'zod';

const restApiConfigSchema = z.object({
  port: z.number(),
});

const databaseConfigSchema = z.object({
  host: z.string(),
  port: z.string(),
  user: z.string(),
  database: z.string(),
  password: z.string(),
});

const sumpConfigSchema = z.object({
  database: databaseConfigSchema,
  restApi: restApiConfigSchema,
});

type SumpConfig = z.infer<typeof sumpConfigSchema>;
type DatabaseConfig = z.infer<typeof databaseConfigSchema>;

export { sumpConfigSchema };

export type { DatabaseConfig, SumpConfig };
