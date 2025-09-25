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

  const accountRepository = new repositories.AccountRepository(databaseClient);
  const accountService = new services.AccountService(accountRepository);

  const tenantRepository = new repositories.TenantRepository(databaseClient);
  const tenantService = new services.TenantService(tenantRepository);

  const tenantEnvironmentRepository =
    new repositories.TenantEnvironmentRepository(databaseClient);
  const tenantEnvironmentService = new services.TenantEnvironmentService(
    tenantEnvironmentRepository
  );

  const tenantEnvironmentAccountRepository =
    new repositories.TenantEnvironmentAccountRepository(databaseClient);
  const tenantEnvironmentAccountService =
    new services.TenantEnvironmentAccountService(
      tenantEnvironmentAccountRepository
    );

  logger.info('Setting up use cases');
  const tenantUseCases = new useCases.TenantUseCase({
    account: accountService,
    tenant: tenantService,
    tenantEnvironment: tenantEnvironmentService,
  });

  const accountUseCases = new useCases.AccountUseCase({
    account: accountService,
    tenant: tenantService,
  });

  const tenantEnvironmentUseCases = new useCases.TenantEnvironmentUseCase({
    tenantEnvironment: tenantEnvironmentService,
  });

  const tenantEnvironmentAccountUseCases =
    new useCases.TenantEnvironmentAccountUseCase({
      tenantEnvironmentAccount: tenantEnvironmentAccountService,
    });

  logger.info('Setting up rest api endpoints');
  const baseRouter = express.Router();
  baseRouter.use(
    '/',
    endpointFactories.makeTenantUseCaseEndpoints(tenantUseCases)
  );
  baseRouter.use(
    '/tenants/:tenantId',
    endpointFactories.makeAccountUseCaseEndpoints(accountUseCases)
  );
  baseRouter.use(
    '/tenants/:tenantId',
    endpointFactories.makeTenantEnvironmentUseCaseEndpoints(
      tenantEnvironmentUseCases
    )
  );

  baseRouter.use(
    '/tenant-environments/:tenantEnvironmentId',
    endpointFactories.makeTenantEnvironmentAccountUseCaseEndpoints(
      tenantEnvironmentAccountUseCases
    )
  );

  const startServer = setupExpressRestApi(baseRouter, config.restApi);

  logger.info('Starting rest api server');
  startServer();
}

(async () => {
  await bootstrap();
})().catch((e: unknown) => {
  logger.error((e as Error).toString(), (e as Error).stack);
});
