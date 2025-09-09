import express from 'express';
import { BaseService } from '../base-classes';
import { setupExpressRestApi } from '../infra/rest-api/express';
import { RestApiConfig } from '../lib/types';
import { tenants } from './tenants';
import { ServiceRecord, UseCaseRecord } from './types/business.type';

class BusinessService extends BaseService {
  private serviceRecord: ServiceRecord;
  private useCaseRecord = {} as UseCaseRecord;
  private httpServerRouter: express.Router;
  private httpServer?: () => void;

  constructor(services: ServiceRecord, restApi?: RestApiConfig) {
    super('business-service');
    this.httpServerRouter = express.Router();
    this.serviceRecord = services;
    this.setupUseCases(!!restApi);

    if (restApi) {
      this.httpServer = setupExpressRestApi([this.httpServerRouter], {
        port: 8080,
      });
    }

    Object.freeze(this.useCaseRecord);
  }

  /**
   * `Parameters` [https://www.typescriptlang.org/docs/handbook/utility-types.html#parameterstype]
   * SO question [https://stackoverflow.com/a/51851844]
   *
   * @NOTE: this function is poo poo
   */
  private setupUseCases(setupRouter = false): void {
    const useCaseDomains = [{ tenants }];
    const httpRouters: Record<string, express.Router[]> = {};

    useCaseDomains.forEach((domain) => {
      const domainName = Object.keys(domain)[0] as keyof typeof domain;
      const useCaseNames = Object.keys(
        domain[domainName]
      ) as (keyof (typeof domain)[typeof domainName])[];

      httpRouters[domainName] = [];

      useCaseNames.forEach((useCaseName) => {
        const useCaseFn = domain[domainName][useCaseName].service;
        const useCaseHttpEndpointController =
          domain[domainName][useCaseName].endpoint;

        type UseCaseArgument = Parameters<typeof useCaseFn>[1];
        const useCaseFnCaller = async (dto: UseCaseArgument) =>
          useCaseFn(this.serviceRecord, dto);

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (!this.useCaseRecord[domainName]) {
          this.useCaseRecord[domainName] = {};
        }

        this.useCaseRecord[domainName][useCaseName] = useCaseFnCaller;

        if (setupRouter) {
          const useCaseRouter = useCaseHttpEndpointController(useCaseFnCaller);
          httpRouters[domainName]?.push(useCaseRouter);
        }
      });
    });

    if (setupRouter) {
      httpRouters['tenants']?.forEach((router) => {
        this.httpServerRouter.use('/tenants', router);
      });

      httpRouters['accounts']?.forEach((router) => {
        this.httpServerRouter.use('/tenants/:tenantId/accounts', router);
      });

      httpRouters['tenantEnvironments']?.forEach((router) => {
        this.httpServerRouter.use(
          '/tenants/:tenantId/tenantEnvironments',
          router
        );
      });

      httpRouters['tenantEnvironmentAccounts']?.forEach((router) => {
        this.httpServerRouter.use(
          '/tenantEnvironments/:tenantEnvironment/tenantEnvironmentAccounts',
          router
        );
      });
    }
  }

  listen(): void {
    if (this.httpServer) {
      this.httpServer();
    } else {
      this.logger.warn('Http server is not setup.');
    }
  }
}

export { BusinessService };
