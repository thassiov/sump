import { getDatabaseClient } from './infra/database/postgres/lib/connection-client';
import { setupExpressRestApi } from './infra/rest-api/express';
import { configLoader } from './lib/config';
import { setupLogger } from './lib/logger/logger';
import { SumpConfig } from './lib/types';
import * as services from './services';

const logger = setupLogger('sump-bootstrap');

async function bootstrap(sumpConfig?: object) {
  logger.info('Starting bootstrap process');
  logger.info('Loading configs');
  const config: SumpConfig = await configLoader(sumpConfig);

  // @NOTE: starting sump as a standalone 'micro' service
  if (config.service) {
    logger.info(`Setting up service ${config.service} as a http service`);

    logger.info(
      `Fetching databaseClient instance for ${config.service} service`
    );
    const databaseClient = getDatabaseClient(config.database);

    logger.info(`Creating ${config.service} repository instance`);
    const serviceRepository = new services[config.service].repository(
      databaseClient
    );

    logger.info(`Creating ${config.service} service instance`);
    const serviceInstance = new services[config.service].service(
      serviceRepository
    );

    logger.info('Setting up service http endpoints');
    const router = services[config.service].endpoints(serviceInstance);

    logger.info('Setting up rest api server');
    const startServer = setupExpressRestApi([router], config.restApi);

    logger.info('Starting server');
    startServer();
  } else {
    logger.info('Fetching databaseClient instance for the main service');
    const databaseClient = getDatabaseClient(config.database);

    logger.info("Creating internal service's instances");

    const accountRepository = new services.account.repository(databaseClient);
    const accountService = new services.account.service(accountRepository);

    const tenantRepository = new services.tenant.repository(databaseClient);
    const tenantService = new services.tenant.service(tenantRepository);

    const tenantEnvironmentRepository =
      new services.tenantEnvironment.repository(databaseClient);
    const tenantEnvironmentService = new services.tenantEnvironment.service(
      tenantEnvironmentRepository
    );

    const tenantEnvironmentAccountRepository =
      new services.tenantEnvironmentAccount.repository(databaseClient);
    const tenantEnvironmentAccountService =
      new services.tenantEnvironmentAccount.service(
        tenantEnvironmentAccountRepository
      );

    logger.info("Creating main service's instance");

    logger.info('Starting server');
  }
}

(async () => {
  await bootstrap();
})().catch((e: unknown) => {
  logger.error((e as Error).toString(), (e as Error).stack);
});
