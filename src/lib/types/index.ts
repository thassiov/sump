import { Request, Response } from 'express';
import z from 'zod';

import { BaseRepository, BaseService } from '../../base-classes';
import { BaseHttpService } from '../../base-classes/http-service.base-class';

const uuidv4Schema = z.string().uuid();

const restApiConfigSchema = z.object({
  port: z.number(),
});

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
  service: z.enum(['account']).optional(),
  externalServices: externalServicesRecordSchema.optional(),
  database: databaseConfigSchema,
  restApi: restApiConfigSchema,
});

type SumpConfig = z.infer<typeof sumpConfigSchema>;
type DatabaseConfig = z.infer<typeof databaseConfigSchema>;
type RestApiConfig = z.infer<typeof restApiConfigSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Ctor<T> = abstract new (...args: any[]) => T;

type ServiceModule = {
  service: Ctor<BaseService>;
  httpService: Ctor<BaseHttpService>;
  repository: Ctor<BaseRepository>;
};

type EndpointHandler = (req: Request, res: Response) => Promise<void>;

export { sumpConfigSchema, uuidv4Schema };

export type { DatabaseConfig, EndpointHandler, ServiceModule, SumpConfig, RestApiConfig };
