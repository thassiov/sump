import { config } from 'dotenv';

config();

const env = {
  appEnvironment: process.env['NODE_ENV'] ?? 'development',
};

const database = {
  client: process.env['DB_TYPE'] ?? 'sqlite3',
  connection: {
    filename:
      process.env['DB_LOCATION'] || process.env['NODE_ENV'] === 'test'
        ? ':memory:'
        : '/tmp/aps.sqlite',
    user: process.env['DB_USER'] ?? 'localuser',
    password: process.env['DB_PASSWORD'] ?? 'password',
    host: process.env['DB_HOST'] ?? 'localhost',
    port: process.env['DB_PORT'] ?? '5432',
    database: process.env['DB_NAME'] ?? 'aps',
  },
};

const repository = {
  account: {
    tableName: 'account',
  },
  profile: {
    tableName: 'profile',
  },
};

const configs = {
  repository,
  database,
  env,
};

export { configs };
