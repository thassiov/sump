import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Knex } from 'knex';
import cookieParser from 'cookie-parser';
import { AppModule } from '../app.module';
import { DATABASE_CLIENT } from '../common/database/database.module';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { truncateAllTables } from './database.utils';

let app: INestApplication | undefined;
let dbClient: Knex | undefined;
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
let moduleRef: TestingModule | undefined;

// Test auth secret - must be at least 32 characters
const TEST_AUTH_SECRET = process.env['AUTH_SECRET'] || 'this-is-a-32-character-test-key-for-integration';

/**
 * Creates and initializes the NestJS application for testing.
 * Call this in beforeAll() of your test suite.
 * Mirrors the configuration from main.ts.
 */
export async function createTestApp(): Promise<INestApplication> {
  moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();

  // Configure app to match main.ts
  app.use(cookieParser(TEST_AUTH_SECRET));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  app.setGlobalPrefix('api/v1');

  await app.init();

  dbClient = moduleRef.get<Knex>(DATABASE_CLIENT);

  return app;
}

/**
 * Gets the test auth secret for cookie signing.
 */
export function getTestAuthSecret(): string {
  return TEST_AUTH_SECRET;
}

/**
 * Gets the test application instance.
 * Must call createTestApp() first.
 */
export function getTestApp(): INestApplication {
  if (!app) {
    throw new Error('Test app not initialized. Call createTestApp() first.');
  }
  return app;
}

/**
 * Gets the database client for direct database operations in tests.
 * Must call createTestApp() first.
 */
export function getDbClient(): Knex {
  if (!dbClient) {
    throw new Error('Database client not initialized. Call createTestApp() first.');
  }
  return dbClient;
}

/**
 * Cleans up all data from the database.
 * Call this in beforeEach() to ensure test isolation.
 */
export async function cleanDatabase(): Promise<void> {
  if (!dbClient) {
    throw new Error('Database client not initialized. Call createTestApp() first.');
  }
  await truncateAllTables(dbClient);
}

/**
 * Closes the test application and database connections.
 * Call this in afterAll() of your test suite.
 */
export async function closeTestApp(): Promise<void> {
  if (dbClient) {
    await dbClient.destroy();
  }
  if (app) {
    await app.close();
  }
}

type ProviderToken = string | symbol | (new (...args: unknown[]) => unknown);

/**
 * Gets a provider from the test module.
 * Useful for getting services/repositories in tests.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function getProvider<T>(token: ProviderToken): T {
  if (!moduleRef) {
    throw new Error('Test module not initialized. Call createTestApp() first.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return moduleRef.get<T>(token);
}
