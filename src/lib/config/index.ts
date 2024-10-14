import { config } from 'dotenv';

config();

const envConfigs = {
  appEnvironment: process.env['NODE_ENV'] ?? 'development',
};

const dbConfigs = {
  dbType: process.env['DB_TYPE'] ?? 'sqlite',
  dbLocation:
    process.env['DB_LOCATION'] || process.env['NODE_ENV'] === 'test'
      ? ':memory:'
      : '/tmp/aps_bd.sqlite',
  dbUser: process.env['DB_USER'] ?? 'localuser',
  dbPassword: process.env['DB_PASSWORD'] ?? 'password',
  dbHost: process.env['DB_HOST'] ?? 'localhost',
  dbPort: process.env['DB_PORT'] ?? '5432',
  dbName: process.env['DB_NAME'] ?? 'aps',
};

const configs = {
  ...dbConfigs,
  ...envConfigs,
};

export { configs };
