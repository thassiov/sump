import { Knex } from 'knex';
import { internalConfigs } from '../lib/config';

/**
 * Truncates all application tables in the correct order (respecting foreign key constraints).
 * Uses TRUNCATE ... CASCADE to handle foreign key dependencies.
 */
export async function truncateAllTables(knex: Knex): Promise<void> {
  // Truncate the root table with CASCADE - this will clean all dependent tables
  await knex.raw(
    `TRUNCATE TABLE ${internalConfigs.repository.tenant.tableName} CASCADE`
  );
}

/**
 * Truncates specific tables. Order matters due to foreign key constraints.
 * Tables are truncated in reverse dependency order.
 */
export async function truncateTables(
  knex: Knex,
  tables: Array<keyof typeof internalConfigs.repository>
): Promise<void> {
  for (const table of tables) {
    const tableName = internalConfigs.repository[table].tableName;
    await knex.raw(`TRUNCATE TABLE ${tableName} CASCADE`);
  }
}

/**
 * Gets the count of records in a table.
 * Useful for test assertions.
 */
export async function getTableCount(
  knex: Knex,
  table: keyof typeof internalConfigs.repository
): Promise<number> {
  const tableName = internalConfigs.repository[table].tableName;
  const result = await knex(tableName).count('* as count').first();
  return Number(result?.count ?? 0);
}

/**
 * Checks if the database connection is healthy.
 */
export async function isDatabaseHealthy(knex: Knex): Promise<boolean> {
  try {
    await knex.raw('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
