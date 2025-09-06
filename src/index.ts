import { Router } from 'express';

import { BusinessService } from './business/business.service';
import { getDatabaseClient } from './infra/database/postgres/lib/connection-client';
import { setupExpressRestApi } from './infra/rest-api/express';
import { configLoader } from './lib/config';
import { setupLogger } from './lib/logger/logger';
import { CreateServiceInstanceOptions, SumpConfig } from './lib/types';
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

    logger.info(`Creating ${config.service} service instance`);
    const serviceInstance = createServiceInstance(config.service, {
      databaseClient,
    });

    logger.info('Setting up service endpoints');
    const router = setupServiceEndpoints(
      serviceInstance,
      services[config.service].endpoints
    );

    logger.info('Setting up rest api server');
    const startServer = setupExpressRestApi([router], config.restApi);

    logger.info('Starting server');
    startServer();
  } else {
    console.log('the things from the main service');
    const databaseClient = getDatabaseClient(config.database);

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

    const businessService = new BusinessService({
      account: accountService,
      tenant: tenantService,
      tenantEnvironment: tenantEnvironmentService,
      tenantEnvironmentAccount: tenantEnvironmentAccountService,
    });
  }
}

// @FIX: this types are all wrong, but ill fix it later with some 'typeof baseservice/baserepository'
//  and changes in the base clases themselves
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

// @FIX: this 'any stuff needs to be handled'
function setupServiceEndpoints(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceInstance: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceEndpointFactory: any
): Router {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return serviceEndpointFactory(serviceInstance);
}

// function createHttpServiceInstance(
//   serviceName: keyof typeof services,
//   configs: CreateServiceInstanceOptions
// ) {
//   if (configs.url) {
//     const httpServiceInstance = new services[serviceName].httpService(
//       configs.url
//     );
//     return httpServiceInstance;
//   } else {
//     logger.error(
//       'No config passed when creating http service instance. Exiting...:',
//       serviceName
//     );
//     process.exit(1);
//   }
// }

(async () => {
  await bootstrap();
})().catch(logger.error);
