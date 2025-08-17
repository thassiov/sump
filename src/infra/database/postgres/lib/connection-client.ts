import knex, { Knex } from 'knex';
import knexStringcase from 'knex-stringcase';
import { DatabaseConfig } from '../../../../lib/types';

function getDatabaseClient(databaseConfig: DatabaseConfig): Knex {
  const opts = {
    ...databaseConfig,
    ...knexStringcase(),
    migrations: {
      directory: '../migrations',
      tableName: 'migrations',
      extension: 'ts',
    },
  };

  const client = knex(opts);

  return client;
}

export { getDatabaseClient };
