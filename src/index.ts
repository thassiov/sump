import express from 'express';

import { repositories, services, useCases } from './core';
import { getDatabaseClient } from './infra/database/postgres/lib/connection-client';
import * as endpointFactories from './infra/rest-api/endpoints/';
import { setupExpressRestApi } from './infra/rest-api/express';
import { configLoader } from './lib/config';
import { setupLogger } from './lib/logger/logger';
import { SumpConfig } from './lib/types';

const logger = setupLogger('sump-bootstrap');

async function bootstrap(sumpConfig?: object) {
  logger.info('Starting bootstrap process');
  logger.info('Loading configs');
  const config: SumpConfig = await configLoader(sumpConfig);

  logger.info('Fetching databaseClient instance for the main service');
  const databaseClient = getDatabaseClient(config.database);

  logger.info("Creating internal service's instances");

  const tenantAccountRepository = new repositories.TenantAccountRepository(databaseClient);
  const tenantAccountService = new services.TenantAccountService(tenantAccountRepository);

  const tenantRepository = new repositories.TenantRepository(databaseClient);
  const tenantService = new services.TenantService(tenantRepository);

  const environmentRepository =
    new repositories.EnvironmentRepository(databaseClient);
  const environmentService = new services.EnvironmentService(
    environmentRepository
  );

  const environmentAccountRepository =
    new repositories.EnvironmentAccountRepository(databaseClient);
  const environmentAccountService =
    new services.EnvironmentAccountService(
      environmentAccountRepository
    );

  logger.info('Setting up use cases');
  const tenantUseCases = new useCases.TenantUseCase({
    tenantAccount: tenantAccountService,
    tenant: tenantService,
    environment: environmentService,
  });

  const tenantAccountUseCases = new useCases.TenantAccountUseCase({
    tenantAccount: tenantAccountService,
    tenant: tenantService,
  });

  const environmentUseCases = new useCases.EnvironmentUseCase({
    environment: environmentService,
  });

  const environmentAccountUseCases =
    new useCases.EnvironmentAccountUseCase({
      environmentAccount: environmentAccountService,
    });

  logger.info('Setting up rest api endpoints');
  const baseRouter = express.Router();
  baseRouter.use(
    '/v1',
    endpointFactories.makeTenantUseCaseEndpoints(tenantUseCases)
  );
  baseRouter.use(
    '/v1/tenants/:tenantId',
    endpointFactories.makeTenantAccountUseCaseEndpoints(tenantAccountUseCases)
  );
  baseRouter.use(
    '/v1/tenants/:tenantId',
    endpointFactories.makeEnvironmentUseCaseEndpoints(
      environmentUseCases
    )
  );

  baseRouter.use(
    '/v1/environments/:environmentId',
    endpointFactories.makeEnvironmentAccountUseCaseEndpoints(
      environmentAccountUseCases
    )
  );

  const startServer = await setupExpressRestApi(baseRouter, config.restApi);

  logger.info('Starting rest api server');
  startServer();
}

(async () => {
  await bootstrap();
})().catch((e: unknown) => {
  logger.error((e as Error).toString(), (e as Error).stack);
});
