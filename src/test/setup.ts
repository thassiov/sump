import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Knex } from 'knex';
import { AppModule } from '../app.module';
import { DATABASE_CLIENT } from '../common/database/database.module';
import { truncateAllTables } from './database.utils';

let app: INestApplication;
let dbClient: Knex;
let moduleRef: TestingModule;

/**
 * Creates and initializes the NestJS application for testing.
 * Call this in beforeAll() of your test suite.
 */
export async function createTestApp(): Promise<INestApplication> {
  moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  await app.init();

  dbClient = moduleRef.get<Knex>(DATABASE_CLIENT);

  return app;
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

/**
 * Gets a provider from the test module.
 * Useful for getting services/repositories in tests.
 */
export function getProvider<T>(token: string | symbol | Function): T {
  if (!moduleRef) {
    throw new Error('Test module not initialized. Call createTestApp() first.');
  }
  return moduleRef.get<T>(token as any);
}
