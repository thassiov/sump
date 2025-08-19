import { Knex } from 'knex';
import { getDatabaseClient } from './infra/database/postgres/lib/connection-client';
import { configLoader } from './lib/config';
import { setupLogger } from './lib/logger/logger';
import { SumpConfig } from './lib/types';
import * as services from './services';
import { setupExpressRestApi } from './infra/rest-api/express';

const logger = setupLogger('sump-bootstrap');

async function bootstrap(sumpConfig?: object) {
  logger.info('Starting bootstrap process');
  logger.info('Loading configs');
  const config: SumpConfig = await configLoader(sumpConfig);

  // @NOTE: starting sump as a standalone 'micro' service
  if (config.service) {
    const databaseClient = getDatabaseClient(config.database);
    const serviceInstance = createServiceInstance(config.service, {
      databaseClient,
    });

    const router = services[config.service].endpoints(serviceInstance);
    const startServer = setupExpressRestApi([router], config.restApi);
    startServer();
  }
}

function createServiceInstance(
  serviceName: keyof typeof services,
  configs: CreateServiceInstanceOptions
) {
  if (configs.databaseClient) {
    const serviceRepository = new services[serviceName].repository(
      configs.databaseClient
    );
    const serviceInstance = new services.account.service(serviceRepository);
    return serviceInstance;
  } else {
    logger.error(
      'No config passed when creating service instance. Exiting...:',
      serviceName
    );
    process.exit(1);
  }
}

function createHttpServiceInstance(
  serviceName: keyof typeof services,
  configs: CreateServiceInstanceOptions
) {
  if (configs.url) {
    const httpServiceInstance = new services[serviceName].httpService(
      configs.url
    );
    return httpServiceInstance;
  } else {
    logger.error(
      'No config passed when creating http service instance. Exiting...:',
      serviceName
    );
    process.exit(1);
  }
}

type CreateServiceInstanceOptions = { url?: string; databaseClient?: Knex };

(async () => {
  await bootstrap();
})().catch(logger.error);
