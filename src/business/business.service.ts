import { BaseService } from '../base-classes';
import { IAccountService } from '../services/account/types/service.type';
import { ITenantEnvironmentAccountService } from '../services/tenant-environment-account/types/service.type';
import { ITenantEnvironmentService } from '../services/tenant-environment/types/service.type';
import { ITenantService } from '../services/tenant/types/service.type';
import { tenants } from './tenants';

type ServiceRecord = {
  account: IAccountService;
  tenant: ITenantService;
  tenantEnvironment: ITenantEnvironmentService;
  tenantEnvironmentAccount: ITenantEnvironmentAccountService;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BindFirst<F> = F extends (dep: any, ...rest: infer R) => infer Ret
  ? (...rest: R) => Ret
  : never;

type UseCaseRecordDefinition<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? BindFirst<T[K]>
    : never;
};

type UseCaseRecord = {
  tenants: UseCaseRecordDefinition<typeof tenants>;
  accounts: Record<string, unknown>;
  tenantEnvironments: Record<string, unknown>;
  tenantEnvironmentAccounts: Record<string, unknown>;
};

class BusinessService extends BaseService {
  private serviceRecord: ServiceRecord;
  useCaseRecord: UseCaseRecord = {} as UseCaseRecord;

  constructor(services: ServiceRecord) {
    super('business-service');
    this.serviceRecord = services;
    this.setupUseCases();
    Object.freeze(this.useCaseRecord);
  }

  /**
   * `Parameters` [https://www.typescriptlang.org/docs/handbook/utility-types.html#parameterstype]
   * SO question [https://stackoverflow.com/a/51851844]
   */
  private setupUseCases(): void {
    const useCaseDomains = [{ tenants }];

    useCaseDomains.forEach((useCaseDomain) => {
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      const useCaseDomainName = Object.keys(
        useCaseDomain
      )[0] as keyof UseCaseRecord;

      const useCaseFns = Object.entries(
        useCaseDomain[useCaseDomainName as keyof typeof useCaseDomain]
      ).map(([useCaseName, useCaseFn]) => {
        type UseCaseArgument = Parameters<typeof useCaseFn>[1];
        return [
          [useCaseName],
          async (dto: UseCaseArgument) => useCaseFn(this.serviceRecord, dto),
        ];
      });

      this.useCaseRecord[useCaseDomainName] = Object.fromEntries(useCaseFns);
    });
  }
}

export { BusinessService };
