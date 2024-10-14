import { Sequelize } from 'sequelize';
import { configs } from 'src/lib/config';
import { DatabaseInstanceError } from 'src/lib/errors';
import { logger } from 'src/lib/logger';

let db: Sequelize;

try {
  const dbConnectString =
    configs.dbType == 'sqlite'
      ? `${configs.dbType}:${configs.dbLocation}`
      : `${configs.dbType}://${configs.dbUser}:${configs.dbPassword}@${configs.dbHost}:${configs.dbPort.toString()}/${configs.dbName}`;

  db = new Sequelize(dbConnectString);
} catch (error) {
  const dbError = new DatabaseInstanceError({
    cause: error as Error,
    details: { op: 'Database connection initialization' },
  });
  logger.error(dbError);
  throw dbError;
}

export { db };
