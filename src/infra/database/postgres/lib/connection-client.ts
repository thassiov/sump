import knex, { Knex } from 'knex';
import knexStringcase from 'knex-stringcase';
import { configs } from '../../../../lib/config';

function getDatabaseClient(): Knex {
  const opts = {
    ...configs.database,
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
