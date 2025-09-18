import express from 'express';
import { BaseService } from '../base-classes';
import { setupExpressRestApi } from '../infra/rest-api/express';
import { RestApiConfig } from '../lib/types';
import { accounts } from './accounts';
import { tenants } from './tenants';
import {
  ServiceRecord,
  UseCaseCaller,
  UseCaseRecord,
} from './types/business.type';

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
   * @FIXME: the type of this function should be called 'type IThisIsAllGarbage'
   */
  private setupUseCases(setupRouter = false): void {
    const useCaseDomains = [{ tenants }, { accounts }];
    const httpRouters: Record<string, express.Router[]> = {};

    // @TODO: move to its own function/module
    useCaseDomains.forEach((domain) => {
      const domainName = Object.keys(domain)[0] as keyof typeof domain;
      const useCaseNames = Object.keys(
        // @ts-expect-error @FIXME:  the typing of this entire method is messed up. The logic works alright but I have no types here atm
        domain[domainName]
      ) as (keyof (typeof domain)[typeof domainName])[];

      httpRouters[domainName] = [];

      useCaseNames.forEach((useCaseName) => {
        // @ts-expect-error @FIXME:  the typing of this entire method is messed up. The logic works alright but I have no types here atm
        const useCaseFn = domain[domainName][useCaseName].service;
        const useCaseHttpEndpointController =
          // @ts-expect-error @FIXME:  the typing of this entire method is messed up. The logic works alright but I have no types here atm
          domain[domainName][useCaseName].endpoint;

        type UseCaseArguments = Parameters<UseCaseCaller<typeof useCaseFn>>;
        const useCaseFnCaller = async (
          ...dto: UseCaseArguments
          // eslint-disable-next-line @typescript-eslint/require-await
        ): Promise<unknown> => useCaseFn(this.serviceRecord, ...dto);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!this.useCaseRecord[domainName]) {
          // @ts-expect-error @FIXME:  the typing of this entire method is messed up. The logic works alright but I have no types here atm
          this.useCaseRecord[domainName] = {};
        }

        // @ts-expect-error @FIXME:  the typing of this entire method is messed up. The logic works alright but I have no types here atm
        this.useCaseRecord[domainName][useCaseName] = useCaseFnCaller;

        if (setupRouter) {
          const useCaseRouter = useCaseHttpEndpointController(useCaseFnCaller);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          httpRouters[domainName]?.push(useCaseRouter);
        }
      });
    });

    // @TODO: move to its own function/module
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
