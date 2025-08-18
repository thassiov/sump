import { configLoader } from '../../../../lib/config';
import { setupLogger } from '../../../../lib/logger/logger';
import { getDatabaseClient } from '../lib/connection-client';

const logger = setupLogger('migration-up-tool');

async function runMigrationUp() {
  logger.info('starting migration up script');
  const config = await configLoader();

  const dbClient = getDatabaseClient(config.database);

  await dbClient.migrate.up();
}

(async () => {
  await runMigrationUp();
})().catch(logger.error);
